async function run() {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1j1witr2nLn-LYm-_8K3C03KMGZhhM_rIqRfBIsfQXC8/gviz/tq?tqx=out:json&gid=952167006";
    const response = await fetch(sheetUrl);
    const text = await response.text();
    const jsonString = text.match(/(?<=google\.visualization\.Query\.setResponse\()[\s\S]*(?=\);)/)?.[0];
    if (!jsonString) {
        console.log("Failed to parse JSON string");
        console.log(text.substring(0, 200));
        return;
    }
    const data = JSON.parse(jsonString);
    console.log("Cols:", data.table.cols.map(c => c.label));
    if (data.table.rows.length > 0) {
        console.log("First row:", data.table.rows[0].c.map(c => c ? (c.f || c.v) : null));
        console.log("Second row:", data.table.rows[1].c.map(c => c ? (c.f || c.v) : null));
    } else {
        console.log("No rows found.");
    }
}
run();
