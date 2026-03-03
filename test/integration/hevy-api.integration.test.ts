import { describe, it, expect } from "vitest";
import {
  getV1UserInfo,
  getV1Workouts,
  getV1WorkoutsCount,
  getV1WorkoutsWorkoutid,
  getV1WorkoutsEvents,
  getV1Routines,
  getV1RoutinesRoutineid,
  getV1ExerciseTemplates,
  getV1ExerciseTemplatesExercisetemplateid,
  getV1RoutineFolders,
  getV1RoutineFoldersFolderid,
  zWorkout,
  zRoutine,
  zExerciseTemplate,
} from "hevy-api-client";

const VALID_SET_TYPES = ["normal", "warmup", "dropset", "failure"] as const;

function validateWorkoutSets(exercises: Array<{ sets?: Array<Record<string, unknown>> }>) {
  let totalSets = 0;
  for (const ex of exercises ?? []) {
    const sets = ex.sets ?? [];
    totalSets += sets.length;
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i]!;
      if (set.reps != null) expect(set.reps).toBeGreaterThanOrEqual(0);
      if (set.weight_kg != null) expect(set.weight_kg).toBeGreaterThanOrEqual(0);
      if (set.distance_meters != null) expect(set.distance_meters).toBeGreaterThanOrEqual(0);
      if (set.duration_seconds != null) expect(set.duration_seconds).toBeGreaterThanOrEqual(0);
      if (set.rpe != null) expect(set.rpe).toBeGreaterThanOrEqual(0);
      if (typeof set.type === "string" && set.type) expect(VALID_SET_TYPES).toContain(set.type);
    }
  }
  return totalSets;
}

function validateRoutineSets(exercises: Array<{ sets?: Array<Record<string, unknown>> }>) {
  let totalSets = 0;
  for (const ex of exercises ?? []) {
    const sets = ex.sets ?? [];
    totalSets += sets.length;
    for (let i = 0; i < sets.length; i++) {
      const set = sets[i]!;
      if (set.reps != null) expect(set.reps).toBeGreaterThanOrEqual(0);
      if (set.weight_kg != null) expect(set.weight_kg).toBeGreaterThanOrEqual(0);
      const repRange = set.rep_range as { start?: number; end?: number } | undefined;
      if (repRange?.start != null && repRange?.end != null)
        expect(repRange.start).toBeLessThanOrEqual(repRange.end);
      if (typeof set.type === "string" && set.type) expect(VALID_SET_TYPES).toContain(set.type);
    }
  }
  return totalSets;
}

const API_KEY = process.env.API_KEY ?? process.env.HEVY_API_KEY;
const headers = API_KEY ? { "api-key": API_KEY } : undefined;

/** Normalize a workout for snapshot testing by replacing volatile fields. */
function normalizeWorkoutForSnapshot(workout: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const idFields = ["id", "routine_id", "exercise_template_id"];
  const timestampFields = ["start_time", "end_time", "updated_at", "created_at"];
  const titleFields = ["title"];

  for (const [k, v] of Object.entries(workout)) {
    if (idFields.includes(k) && typeof v === "string") out[k] = "<id>";
    else if (timestampFields.includes(k) && typeof v === "string") out[k] = "<timestamp>";
    else if (titleFields.includes(k) && typeof v === "string") out[k] = "<title>";
    else if (k === "exercises" && Array.isArray(v)) {
      out[k] = v.map((ex) => {
        const e = ex as Record<string, unknown>;
        const norm: Record<string, unknown> = {};
        for (const [ek, ev] of Object.entries(e)) {
          if (ek === "exercise_template_id" && typeof ev === "string") norm[ek] = "<id>";
          else if (ek === "title" && typeof ev === "string") norm[ek] = "<title>";
          else if (ek === "sets" && Array.isArray(ev)) {
            norm[ek] = ev.map((s) => {
              const set = s as Record<string, unknown>;
              return { ...set };
            });
          } else norm[ek] = ev;
        }
        return norm;
      });
    } else out[k] = v;
  }
  return out;
}

describe("Hevy API integration", () => {
  it.runIf(!!API_KEY)("getV1UserInfo returns user info", async () => {
    const result = await getV1UserInfo({ headers });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data?.data) {
      expect(result.data.data).toHaveProperty("id");
    }
  });

  it.runIf(!!API_KEY)("getV1Workouts returns paginated workouts", async () => {
    const result = await getV1Workouts({ headers });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data) {
      expect(result.data).toHaveProperty("workouts");
      expect(Array.isArray(result.data.workouts)).toBe(true);
    }
  });

  it.runIf(!!API_KEY)("getV1WorkoutsCount returns count", async () => {
    const result = await getV1WorkoutsCount({ headers });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data) {
      expect(result.data).toHaveProperty("workout_count");
      expect(typeof result.data.workout_count).toBe("number");
    }
  });

  it.runIf(!!API_KEY)("getV1Routines returns paginated routines", async () => {
    const result = await getV1Routines({ headers });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data) {
      expect(result.data).toHaveProperty("routines");
      expect(Array.isArray(result.data.routines)).toBe(true);
    }
  });

  it.runIf(!!API_KEY)("getV1ExerciseTemplates returns exercise templates", async () => {
    const result = await getV1ExerciseTemplates({ headers });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data) {
      expect(result.data).toHaveProperty("exercise_templates");
      expect(Array.isArray(result.data.exercise_templates)).toBe(true);
    }
  });

  it.runIf(!!API_KEY)("getV1RoutineFolders returns routine folders", async () => {
    const result = await getV1RoutineFolders({ headers });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data) {
      expect(result.data).toHaveProperty("routine_folders");
      expect(Array.isArray(result.data.routine_folders)).toBe(true);
    }
  });

  it.runIf(!!API_KEY)("getV1Workouts with query params", async () => {
    const result = await getV1Workouts({ headers, query: { page: 1, pageSize: 5 } });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data?.workouts) {
      expect(result.data.workouts.length).toBeLessThanOrEqual(5);
    }
  });
});

describe("Hevy API integration (advanced)", () => {
  it.runIf(!!API_KEY)(
    "getV1WorkoutsWorkoutid fetches and validates a specific workout",
    async () => {
      const listResult = await getV1Workouts({ headers, query: { page: 1, pageSize: 1 } });
      expect(listResult.data?.workouts).toBeDefined();
      const workouts = listResult.data!.workouts!;
      if (workouts.length === 0) return;

      const workoutId = workouts[0]!.id;
      expect(workoutId).toBeDefined();

      const result = await getV1WorkoutsWorkoutid({
        headers,
        path: { workoutId: workoutId! },
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();

      const workout = result.data;
      expect(workout).toHaveProperty("id", workoutId);
      expect(workout).toHaveProperty("title");
      expect(workout).toHaveProperty("exercises");
      expect(Array.isArray(workout!.exercises)).toBe(true);

      const parsed = await zWorkout.parseAsync(workout);
      expect(parsed.id).toBe(workoutId);

      const exercises = parsed.exercises ?? [];
      for (const ex of exercises) {
        expect(ex).toHaveProperty("index");
        expect(ex).toHaveProperty("sets");
        if (ex.sets?.length) {
          for (const set of ex.sets) {
            expect(set).toHaveProperty("index");
            if (set.reps != null) expect(typeof set.reps).toBe("number");
            if (set.weight_kg != null) expect(typeof set.weight_kg).toBe("number");
          }
        }
      }
      const totalSets = validateWorkoutSets(exercises);
      expect(totalSets).toBeGreaterThanOrEqual(0);
    },
  );

  it.runIf(!!API_KEY)(
    "getV1WorkoutsWorkoutid snapshot matches workout structure (normalized ids/timestamps/titles)",
    async () => {
      const listResult = await getV1Workouts({ headers, query: { page: 1, pageSize: 1 } });
      if (!listResult.data?.workouts?.length) return;

      const workoutId = listResult.data.workouts[0]!.id;
      const result = await getV1WorkoutsWorkoutid({
        headers,
        path: { workoutId: workoutId! },
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();

      const workout = result.data!;
      const parsed = await zWorkout.parseAsync(workout);
      const normalized = normalizeWorkoutForSnapshot(parsed as unknown as Record<string, unknown>);

      expect(normalized).toMatchSnapshot();
    },
  );

  it.runIf(!!API_KEY)("getV1WorkoutsEvents returns paginated events", async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const result = await getV1WorkoutsEvents({
      headers,
      query: { page: 1, pageSize: 5, since },
    });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data) {
      expect(result.data).toHaveProperty("events");
      expect(Array.isArray(result.data.events)).toBe(true);
      expect(result.data).toHaveProperty("page");
      expect(typeof result.data.page).toBe("number");
    }
  });

  it.runIf(!!API_KEY)(
    "getV1RoutinesRoutineid fetches and validates a specific routine",
    async () => {
      const listResult = await getV1Routines({ headers, query: { page: 1, pageSize: 1 } });
      expect(listResult.data?.routines).toBeDefined();
      const routines = listResult.data!.routines!;
      if (routines.length === 0) return;

      const routineId = routines[0]!.id;
      expect(routineId).toBeDefined();

      const result = await getV1RoutinesRoutineid({
        headers,
        path: { routineId: routineId! },
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
      const routine = result.data?.routine;
      if (!routine) return;

      expect(routine).toHaveProperty("id", routineId);
      expect(routine).toHaveProperty("title");
      expect(routine).toHaveProperty("exercises");
      expect(Array.isArray(routine.exercises)).toBe(true);

      const parsed = await zRoutine.parseAsync(routine);
      const exercises = parsed.exercises ?? [];
      for (const ex of exercises) {
        expect(ex).toHaveProperty("index");
        expect(ex).toHaveProperty("title");
        expect(ex).toHaveProperty("sets");
        if (ex.sets?.length) {
          for (const set of ex.sets) {
            expect(set).toHaveProperty("index");
            if (set.reps != null) expect(typeof set.reps).toBe("number");
            if (set.weight_kg != null) expect(typeof set.weight_kg).toBe("number");
            if (set.rep_range) {
              expect(set.rep_range).toHaveProperty("start");
              expect(set.rep_range).toHaveProperty("end");
            }
          }
        }
      }
      const totalSets = validateRoutineSets(exercises);
      expect(totalSets).toBeGreaterThanOrEqual(0);
    },
  );

  it.runIf(!!API_KEY)(
    "getV1ExerciseTemplatesExercisetemplateid fetches and validates a specific template",
    async () => {
      const listResult = await getV1ExerciseTemplates({ headers, query: { page: 1, pageSize: 1 } });
      expect(listResult.data?.exercise_templates).toBeDefined();
      const templates = listResult.data!.exercise_templates!;
      if (templates.length === 0) return;

      const templateId = templates[0]!.id;
      expect(templateId).toBeDefined();

      const result = await getV1ExerciseTemplatesExercisetemplateid({
        headers,
        path: { exerciseTemplateId: String(templateId!) },
      });
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
      if (!result.data) return;

      expect(result.data).toHaveProperty("id");
      expect(result.data).toHaveProperty("title");
      expect(typeof result.data.title).toBe("string");
      expect(result.data.title!.length).toBeGreaterThan(0);

      const parsed = await zExerciseTemplate.parseAsync(result.data);
      expect(parsed.id).toBeDefined();
      expect(parsed.title).toBeDefined();
      if (parsed.primary_muscle_group != null)
        expect(typeof parsed.primary_muscle_group).toBe("string");
      if (parsed.secondary_muscle_groups != null)
        expect(Array.isArray(parsed.secondary_muscle_groups)).toBe(true);
    },
  );

  it.runIf(!!API_KEY)("getV1RoutineFoldersFolderid fetches a specific folder", async () => {
    const listResult = await getV1RoutineFolders({ headers, query: { page: 1, pageSize: 1 } });
    expect(listResult.data?.routine_folders).toBeDefined();
    const folders = listResult.data!.routine_folders!;
    if (folders.length === 0) return;

    const folderId = folders[0]!.id;
    expect(folderId).toBeDefined();

    const result = await getV1RoutineFoldersFolderid({
      headers,
      path: { folderId: String(folderId!) },
    });
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
    if (result.data) {
      expect(result.data).toHaveProperty("id", folderId);
      expect(result.data).toHaveProperty("title");
    }
  });
});
