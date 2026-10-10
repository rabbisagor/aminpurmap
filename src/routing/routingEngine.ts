/**
 * আমিনপুর রোড নেটওয়ার্ক রাউটিং ইঞ্জিন
 * অফলাইন রোড গ্রাফ অ্যালগরিদম ও বাংলা দিকনির্দেশনা
 */

import { ROADS_DATA } from '../data/roadsData';
import { RouteResult, RouteInstruction, TravelMode } from '../types';
import { calculateDistanceMeters, calculateBearing } from '../utils/geo';
import { formatDistance } from '../utils/bangla';

interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  roadName_bn: string;
}

interface GraphEdge {
  targetId: string;
  weight: number; // দূরত্ব মিটারে
  roadName_bn: string;
  coordinates: [number, number][];
}

class RoadGraph {
  nodes: Map<string, GraphNode> = new Map();
  adjacencyList: Map<string, GraphEdge[]> = new Map();

  constructor() {
    this.buildGraph();
  }

  private buildGraph() {
    ROADS_DATA.forEach((road) => {
      // জলপথ শুধু ফেরি বা বিশেষ ক্ষেত্রে, সাধারণ সড়ক নেটওয়ার্ক
      for (let i = 0; i < road.coordinates.length - 1; i++) {
        const p1 = road.coordinates[i];
        const p2 = road.coordinates[i + 1];

        const id1 = `${p1[0].toFixed(4)},${p1[1].toFixed(4)}`;
        const id2 = `${p2[0].toFixed(4)},${p2[1].toFixed(4)}`;

        if (!this.nodes.has(id1)) {
          this.nodes.set(id1, { id: id1, lat: p1[0], lng: p1[1], roadName_bn: road.name_bn });
          this.adjacencyList.set(id1, []);
        }
        if (!this.nodes.has(id2)) {
          this.nodes.set(id2, { id: id2, lat: p2[0], lng: p2[1], roadName_bn: road.name_bn });
          this.adjacencyList.set(id2, []);
        }

        const dist = calculateDistanceMeters(p1[0], p1[1], p2[0], p2[1]);

        this.adjacencyList.get(id1)!.push({
          targetId: id2,
          weight: dist,
          roadName_bn: road.name_bn,
          coordinates: [p1, p2],
        });

        this.adjacencyList.get(id2)!.push({
          targetId: id1,
          weight: dist,
          roadName_bn: road.name_bn,
          coordinates: [p2, p1],
        });
      }
    });

    // সংযোগস্থল তৈরি: যে নোডগুলো কাছাকাছি (১৫০ মিটারের মধ্যে) তাদের যুক্ত করা
    const nodeList = Array.from(this.nodes.values());
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const n1 = nodeList[i];
        const n2 = nodeList[j];
        if (n1.id !== n2.id) {
          const d = calculateDistanceMeters(n1.lat, n1.lng, n2.lat, n2.lng);
          if (d <= 150) {
            this.adjacencyList.get(n1.id)!.push({
              targetId: n2.id,
              weight: d,
              roadName_bn: 'সংযোগ মোড়',
              coordinates: [[n1.lat, n1.lng], [n2.lat, n2.lng]],
            });
            this.adjacencyList.get(n2.id)!.push({
              targetId: n1.id,
              weight: d,
              roadName_bn: 'সংযোগ মোড়',
              coordinates: [[n2.lat, n2.lng], [n1.lat, n1.lng]],
            });
          }
        }
      }
    }
  }

  findNearestNode(lat: number, lng: number): GraphNode | null {
    let nearest: GraphNode | null = null;
    let minDistance = Infinity;

    this.nodes.forEach((node) => {
      const d = calculateDistanceMeters(lat, lng, node.lat, node.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = node;
      }
    });

    return nearest;
  }

  dijkstra(startId: string, targetId: string): { pathNodeIds: string[]; totalDistance: number } | null {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const unvisited = new Set<string>();

    this.nodes.forEach((_, id) => {
      distances.set(id, Infinity);
      previous.set(id, null);
      unvisited.add(id);
    });

    distances.set(startId, 0);

    while (unvisited.size > 0) {
      let currentId: string | null = null;
      let smallestDist = Infinity;

      unvisited.forEach((id) => {
        const dist = distances.get(id)!;
        if (dist < smallestDist) {
          smallestDist = dist;
          currentId = id;
        }
      });

      if (!currentId || smallestDist === Infinity) break;
      if (currentId === targetId) break;

      unvisited.delete(currentId);

      const neighbors = this.adjacencyList.get(currentId) || [];
      for (const edge of neighbors) {
        if (!unvisited.has(edge.targetId)) continue;

        const alt = distances.get(currentId)! + edge.weight;
        if (alt < distances.get(edge.targetId)!) {
          distances.set(edge.targetId, alt);
          previous.set(edge.targetId, currentId);
        }
      }
    }

    if (distances.get(targetId) === Infinity) {
      return null;
    }

    const path: string[] = [];
    let curr: string | null = targetId;
    while (curr) {
      path.unshift(curr);
      curr = previous.get(curr) || null;
    }

    return {
      pathNodeIds: path,
      totalDistance: distances.get(targetId)!,
    };
  }
}

const roadGraphInstance = new RoadGraph();

/**
 * ভ্রমণের গতিবেগ (কিমি/ঘণ্টা)
 */
const SPEEDS_KMH: Record<TravelMode, number> = {
  car: 38,
  bike: 35,
  bicycle: 15,
  walk: 4.8,
};

/**
 * দুটি স্থানাঙ্কের মধ্যে রুট নির্ণয়
 */
export async function calculateRoute(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  mode: TravelMode = 'bike',
  sourceNameBn: string = 'শুরুর স্থান',
  destNameBn: string = 'গন্তব্য স্থান'
): Promise<RouteResult> {
  const startNode = roadGraphInstance.findNearestNode(startLat, startLng);
  const destNode = roadGraphInstance.findNearestNode(destLat, destLng);

  if (!startNode || !destNode) {
    throw new Error('আমিনপুর রোড নেটওয়ার্কে কোনো সংযোগকারী রাস্তা পাওয়া যায়নি');
  }

  const result = roadGraphInstance.dijkstra(startNode.id, destNode.id);

  if (!result || result.pathNodeIds.length === 0) {
    // সরাসরি সংযোগ (ফলব্যাক)
    const directDist = calculateDistanceMeters(startLat, startLng, destLat, destLng);
    const speed = SPEEDS_KMH[mode];
    const durationMin = (directDist / 1000 / speed) * 60;
    return {
      coordinates: [
        [startLat, startLng],
        [destLat, destLng],
      ],
      distance_km: Number((directDist / 1000).toFixed(2)),
      duration_min: Math.max(1, Math.round(durationMin)),
      instructions: [
        {
          instruction_bn: `${destNameBn}-এর দিকে সরাসরি অগ্রসর হোন`,
          distance_m: directDist,
          duration_s: durationMin * 60,
          coordinate: [startLat, startLng],
          modifier: 'straight',
        },
        {
          instruction_bn: 'আপনার গন্তব্যে পৌঁছে গেছেন',
          distance_m: 0,
          duration_s: 0,
          coordinate: [destLat, destLng],
          modifier: 'destination',
        },
      ],
      source_bn: sourceNameBn,
      destination_bn: destNameBn,
      mode,
    };
  }

  // রুট পয়েন্ট ও বাংলা টার্ন-বাই-টার্ন নির্দেশনা তৈরি
  const routePoints: [number, number][] = [[startLat, startLng]];
  const instructions: RouteInstruction[] = [];

  const startToFirstDist = calculateDistanceMeters(startLat, startLng, startNode.lat, startNode.lng);
  instructions.push({
    instruction_bn: `${startNode.roadName_bn} সংযোগে প্রবেশ করুন`,
    distance_m: Math.round(startToFirstDist),
    duration_s: Math.round((startToFirstDist / 1000 / SPEEDS_KMH[mode]) * 3600),
    coordinate: [startLat, startLng],
    modifier: 'straight',
  });

  for (let i = 0; i < result.pathNodeIds.length; i++) {
    const node = roadGraphInstance.nodes.get(result.pathNodeIds[i])!;
    routePoints.push([node.lat, node.lng]);

    if (i < result.pathNodeIds.length - 1) {
      const nextNode = roadGraphInstance.nodes.get(result.pathNodeIds[i + 1])!;
      const segDist = calculateDistanceMeters(node.lat, node.lng, nextNode.lat, nextNode.lng);

      if (i > 0) {
        const prevNode = roadGraphInstance.nodes.get(result.pathNodeIds[i - 1])!;
        const b1 = calculateBearing(prevNode.lat, prevNode.lng, node.lat, node.lng);
        const b2 = calculateBearing(node.lat, node.lng, nextNode.lat, nextNode.lng);
        let turnAngle = b2 - b1;
        if (turnAngle < -180) turnAngle += 360;
        if (turnAngle > 180) turnAngle -= 360;

        let modifier: RouteInstruction['modifier'] = 'straight';
        let turnText = 'সোজা চলুন';

        if (turnAngle > 40) {
          modifier = 'right';
          turnText = `${node.roadName_bn}-এ ডানে মোড় নিন`;
        } else if (turnAngle < -40) {
          modifier = 'left';
          turnText = `${node.roadName_bn}-এ বাঁয়ে মোড় নিন`;
        } else if (turnAngle > 15) {
          modifier = 'slight_right';
          turnText = 'হালকা ডানে মোড় নিন';
        } else if (turnAngle < -15) {
          modifier = 'slight_left';
          turnText = 'হালকা বাঁয়ে মোড় নিন';
        }

        instructions.push({
          instruction_bn: `${turnText} (${formatDistance(segDist, true)})`,
          distance_m: Math.round(segDist),
          duration_s: Math.round((segDist / 1000 / SPEEDS_KMH[mode]) * 3600),
          coordinate: [node.lat, node.lng],
          modifier,
        });
      }
    }
  }

  routePoints.push([destLat, destLng]);
  instructions.push({
    instruction_bn: `${destNameBn}-এ পৌঁছে গেছেন`,
    distance_m: 0,
    duration_s: 0,
    coordinate: [destLat, destLng],
    modifier: 'destination',
  });

  const totalDist = result.totalDistance + startToFirstDist;
  const speed = SPEEDS_KMH[mode];
  const durationMin = (totalDist / 1000 / speed) * 60;

  return {
    coordinates: routePoints,
    distance_km: Number((totalDist / 1000).toFixed(2)),
    duration_min: Math.max(1, Math.round(durationMin)),
    instructions,
    source_bn: sourceNameBn,
    destination_bn: destNameBn,
    mode,
  };
}
