async function run() {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/gviz/tq?tqx=out:json";
    const res = await fetch(sheetUrl);
    const text = await res.text();
    const jsonString = text.match(/(?<=google\.visualization\.Query\.setResponse\()[\s\S]*(?=\);)/)?.[0];
    const data = JSON.parse(jsonString);
    console.log("Progress Sheet Headers:", data.table.cols.map(c => c.label));
    
    const membersUrl = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/gviz/tq?tqx=out:json&gid=0";
    const res2 = await fetch(membersUrl);
    const text2 = await res2.text();
    const jsonString2 = text2.match(/(?<=google\.visualization\.Query\.setResponse\()[\s\S]*(?=\);)/)?.[0];
    const data2 = JSON.parse(jsonString2);
    console.log("Members Sheet Headers:", data2.table.cols.map(c => c.label));
}
run();
