# Hevy API Client

A TypeScript client for the [Hevy API](https://www.hevy.com/developer), generated from the official OpenAPI specification.

## Installation

```bash
npm install hevy-api-client
```

## Usage

First, you'll need to get your API key from the [Hevy developer settings](https://hevy.com/settings?developer).

Then, you can import and use the `HevyAPIClient` in your project:

```typescript
import { HevyAPIClient } from 'hevy-api-client';

// 1. Create a new client instance with your API key.
const client = new HevyAPIClient('YOUR_HEVY_API_KEY');

// 2. Define an async function to call the API.
async function getWorkouts() {
  try {
    // 3. Call the desired method with any required parameters.
    // The API key is automatically included in the headers.
    const response = await client.getV1Workouts({
      query: {
        page: 1,
        pageSize: 10,
      },
    });

    // 4. Log the response data.
    console.log(response.data);
  } catch (error) {
    console.error('Failed to fetch workouts:', error);
  }
}

// 5. Run the function.
getWorkouts();
```

## API Methods

The client provides the following methods:

*   `getV1Workouts(options)`
*   `postV1Workouts(options)`
*   `getV1WorkoutsCount(options)`
*   `getV1WorkoutsEvents(options)`
*   `getV1WorkoutsByWorkoutId(options)`
*   `putV1WorkoutsByWorkoutId(options)`
*   `getV1Routines(options)`
*   `postV1Routines(options)`
*   `getV1RoutinesByRoutineId(options)`
*   `putV1RoutinesByRoutineId(options)`
*   `getV1ExerciseTemplates(options)`
*   `getV1ExerciseTemplatesByExerciseTemplateId(options)`
*   `getV1RoutineFolders(options)`
*   `postV1RoutineFolders(options)`
*   `getV1RoutineFoldersByFolderId(options)`
*   `deleteV1WebhookSubscription(options)`
*   `getV1WebhookSubscription(options)`
*   `postV1WebhookSubscription(options)`

For more information on the available parameters for each method, please refer to the [Hevy API documentation](https://www.hevy.com/developer).

## Error Handling

All API methods return a promise. If the request fails, the promise will be rejected with an error. You can use a `try...catch` block to handle these errors, as shown in the example above.

## Contributing

This client is generated from the official Hevy OpenAPI specification using [@hey-api/openapi-ts](https://hey-api.com/openapi-ts).

To regenerate the client, first fetch the latest OpenAPI specification:

```bash
npm run fetch-spec
```

Then, run the following command to regenerate the client:

```bash
npm run generate-client
```

This will output the generated files to the `src/generated` directory.
