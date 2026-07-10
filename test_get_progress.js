const { z } = require('zod');

function extractSheetId(url) {
    let match = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/.exec(url);
    if (match) return match[1];
    return null;
}

async function getProgress(sheetUrl) {
    const sheetId = extractSheetId(sheetUrl);
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    const response = await fetch(gvizUrl);
    const text = await response.text();
    const jsonString = text.match(/(?<=google\.visualization\.Query\.setResponse\()[\s\S]*(?=\);)/)?.[0];
    const data = JSON.parse(jsonString);
    const {cols, rows} = data.table;
    
    // Columns: 0: Name, 1: queue, 2: Part, 3+: Songs
    const songHeaders = cols.slice(3).map(col => col.label);

    const members = rows.map((row, index) => {
        const nameCell = row.c[0];
        const name = nameCell ? (nameCell.f ?? nameCell.v) : null;
        
        let queue = '';
        if (row.c.length > 1) {
          const queueCell = row.c[1];
          queue = queueCell ? (queueCell.f ?? queueCell.v)?.toString() : '';
        }
        
        let part = '';
        if (row.c.length > 2) {
          const partCell = row.c[2];
          part = partCell ? (partCell.f ?? partCell.v) : '';
        }

        const songs = songHeaders.map((songName, songIndex) => {
           const cell = row.c[songIndex + 3];
           let completed = false;
           if (cell) {
              completed = cell.v === true || cell.v === 'TRUE' || cell.v === 'true' || cell.v === 1;
           }
           return {
              name: songName,
              completed
           };
        });

        return {
          name: name || '',
          part: part || '',
          queue,
          completedSongs: songs.filter(s => s.completed).length,
          totalSongs: songs.length
        };
    }).filter(member => member.name && member.name.trim().toLowerCase() !== 'name');

    return members;
}

getProgress("https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing")
    .then(members => {
        console.log("Found members:", members.length);
        console.log("Sample members:", members.slice(0, 3));
    });
