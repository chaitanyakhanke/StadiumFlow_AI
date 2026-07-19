import { POI, Edge, Zone, RouteResult, CongestionLevel } from '@/types';
import { calculateCongestionLevel } from '../crowd/engine';

export interface RouteOptions {
  requireAccessible?: boolean;
  avoidCongested?: boolean;
}

/**
 * Deterministic Dijkstra-based routing engine for the stadium.
 */
export function calculateRoute(
  pois: POI[],
  edges: Edge[],
  zones: Zone[],
  startPoiId: string,
  endPoiId: string,
  options: RouteOptions = {}
): RouteResult | null {
  const { requireAccessible = false, avoidCongested = false } = options;

  // 1. Check if start/end POIs exist and are valid
  const poiMap = new Map<string, POI>(pois.map(p => [p.id, p]));
  const zoneMap = new Map<string, Zone>(zones.map(z => [z.id, z]));
  const edgeMap = new Map<string, Edge>();
  edges.forEach(e => {
    edgeMap.set(`${e.source}_${e.target}`, e);
    edgeMap.set(`${e.target}_${e.source}`, e);
  });

  const startPoi = poiMap.get(startPoiId);
  const endPoi = poiMap.get(endPoiId);
  if (!startPoi || !endPoi) return null;

  // If destination or origin is closed, no path is allowed unless they are the same
  if (startPoiId !== endPoiId && (startPoi.isClosed || endPoi.isClosed)) {
    return null;
  }

  // If accessible route is requested, but start/end is not accessible, no path is allowed
  if (requireAccessible && (!startPoi.isAccessible || !endPoi.isAccessible)) {
    return null;
  }

  // 2. Setup graph structure
  // Build adjacency list for efficient neighbor lookup
  const graph: { [nodeId: string]: { edge: Edge; targetId: string }[] } = {};
  pois.forEach(p => {
    graph[p.id] = [];
  });

  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push({ edge, targetId: edge.target });
    }
    if (graph[edge.target]) {
      graph[edge.target].push({ edge, targetId: edge.source });
    }
  });

  // 3. Dijkstra's Algorithm
  const distances: { [nodeId: string]: number } = {};
  const previous: { [nodeId: string]: string | null } = {};
  const unvisited = new Set<string>();

  pois.forEach(p => {
    distances[p.id] = Infinity;
    previous[p.id] = null;
    unvisited.add(p.id);
  });

  distances[startPoiId] = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach(nodeId => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    });

    if (currentId === null || currentId === endPoiId) {
      break;
    }

    unvisited.delete(currentId);

    // Update distances of neighbors
    const neighbors = graph[currentId] || [];
    for (const { edge, targetId } of neighbors) {
      if (!unvisited.has(targetId)) continue;

      const targetPoi = poiMap.get(targetId);
      if (!targetPoi) continue;

      // Filter: Skip closed edges or closed POIs
      if (edge.isClosed || targetPoi.isClosed) continue;

      // Filter: Skip inaccessible edges or POIs if accessible route is required
      if (requireAccessible && (!edge.isAccessible || !targetPoi.isAccessible)) {
        continue;
      }

      // Calculate traversal cost (distance + congestion penalty)
      let penaltyMultiplier = 1.0;
      let congestionBand: CongestionLevel = 'GREEN';

      if (avoidCongested) {
        const targetZone = zoneMap.get(targetPoi.zoneId);
        if (targetZone) {
          congestionBand = calculateCongestionLevel(
            targetZone.currentOccupancy,
            targetZone.capacity
          );
          
          switch (congestionBand) {
            case 'RED':
              penaltyMultiplier = 4.0;
              break;
            case 'ORANGE':
              penaltyMultiplier = 2.0;
              break;
            case 'YELLOW':
              penaltyMultiplier = 1.3;
              break;
            default:
              penaltyMultiplier = 1.0;
          }
        }
      }

      const cost = edge.distance * penaltyMultiplier;
      const totalCost = distances[currentId] + cost;

      if (totalCost < distances[targetId]) {
        distances[targetId] = totalCost;
        previous[targetId] = currentId;
      }
    }
  }

  // 4. Reconstruct path
  if (distances[endPoiId] === Infinity) {
    return null; // Destination unreachable
  }

  const path: string[] = [];
  let curr: string | null = endPoiId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  // 5. Calculate physical metrics (actual distance travelled without penalty multipliers)
  let totalDistance = 0;
  let totalCongestionCost = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    
    // Find the original edge distance
    const connectedEdge = edgeMap.get(`${u}_${v}`);
    const edgeDist = connectedEdge ? connectedEdge.distance : 0;
    totalDistance += edgeDist;
    
    // Calculate congestion cost component
    const nextPoi = poiMap.get(v);
    if (nextPoi) {
      const nextZone = zoneMap.get(nextPoi.zoneId);
      if (nextZone && avoidCongested) {
        const band = calculateCongestionLevel(nextZone.currentOccupancy, nextZone.capacity);
        let multiplier = 1.0;
        if (band === 'RED') multiplier = 4.0;
        else if (band === 'ORANGE') multiplier = 2.0;
        else if (band === 'YELLOW') multiplier = 1.3;
        
        totalCongestionCost += edgeDist * (multiplier - 1.0);
      }
    }
  }

  // Walking speed: standard is 1.2 meters per second (~72 meters/minute)
  const baseWalkingSpeedMps = 1.2;
  let totalSeconds = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const connectedEdge = edgeMap.get(`${u}_${v}`);
    const edgeDist = connectedEdge ? connectedEdge.distance : 0;
    
    const targetPoi = poiMap.get(v);
    const targetZone = targetPoi ? zoneMap.get(targetPoi.zoneId) : null;
    let localMultiplier = 1.0;
    if (targetZone) {
      const band = calculateCongestionLevel(targetZone.currentOccupancy, targetZone.capacity);
      if (band === 'RED') localMultiplier = 4.0;
      else if (band === 'ORANGE') localMultiplier = 2.0;
      else if (band === 'YELLOW') localMultiplier = 1.3;
    }
    
    const effectiveSpeed = baseWalkingSpeedMps / localMultiplier;
    totalSeconds += edgeDist / effectiveSpeed;
  }
  
  const etaMinutes = Math.max(1, Math.round(totalSeconds / 60));

  return {
    path,
    totalDistance,
    etaMinutes,
    isAccessible: path.every(nodeId => {
      const poi = poiMap.get(nodeId);
      return poi ? poi.isAccessible : false;
    }),
    costExplain: {
      baseDistance: totalDistance,
      congestionPenalty: Math.round(totalCongestionCost),
      accessibilityFilter: requireAccessible
    }
  };
}
