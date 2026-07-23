import { config } from 'dotenv';
config({ path: '.env.local' });
import { getQueueHistory } from '../src/lib/actions';

const PROGRESS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing";

async function main() {
    const { history, error } = await getQueueHistory(PROGRESS_SHEET_URL);
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    if (!history) {
        console.log("No history found.");
        return;
    }

    const counts = new Map<number, string[]>();
    for (const [name, count] of history.entries()) {
        if (!counts.has(count)) {
            counts.set(count, []);
        }
        counts.get(count)!.push(name);
    }

    console.log("Queue History Summary:");
    const sortedCounts = Array.from(counts.keys()).sort((a, b) => b - a);
    
    for (const count of sortedCounts) {
        const names = counts.get(count)!.sort();
        console.log(`\n=== Queued ${count} Time(s) [Total: ${names.length} members] ===`);
        names.forEach(n => console.log(`- ${n}`));
    }
}

main().catch(console.error);
