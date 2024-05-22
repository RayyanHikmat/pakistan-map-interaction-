var map = L.map('map').setView([33.6844, 73.0479], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

var highlight = { fillColor: 'red', weight: 2, opacity: 1, color: 'black', fillOpacity: 0.5 };

var geojsonLayer = L.geoJSON(data, {
    style: { fillColor: 'blue', weight: 2, opacity: 0.7, color: 'black', fillOpacity: 0.5 },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<p><b> Name: </b>" + feature.properties.name + "</p>");
        layer.on({ 
            mouseover: function (e) { layer.setStyle(highlight); },
            mouseout: function (e) { geojsonLayer.resetStyle(layer); },
            click: function (e) {
                geojsonLayer.setStyle(function (feature) {
                    return { fillColor: 'blue', weight: 2, opacity: 0.7, color: 'black', fillOpacity: 0.5 };
                });
                layer.setStyle(highlight);
                getSelectedValue(feature.properties.name);
            }
        });
    }
}).addTo(map);

$(document).ready(function () {
   
    $("#NorthernAreas").click(function () {
        filterMap("Northern Areas");
    });
    $("# N.W.F.P.").click(function () {
        filterMap("N.W.F.P.");
    });
    $("#Punjab").click(function () {
        filterMap("Punjab");
    });
    $("#Baluchistan").click(function () {
        filterMap("Baluchistan");
    });
    $("#Sind").click(function () {
        filterMap("Sind");
    });
    $("#FCT").click(function () {
        filterMap("F.C.T.");
        $("#KPK").click(function () {
            filterMap("K.P.K");
        });
    });
});

function filterMap(region) {
    geojsonLayer.eachLayer(function (layer) {
      
        layer.setStyle({ fillColor: 'blue', weight: 2, opacity: 0.7, color: 'black', fillOpacity: 0.5 });
       
        if (layer.feature.properties.name === region) {
            layer.setStyle({ fillColor: 'green', weight: 2, opacity: 1, color: 'black', fillOpacity: 0.5 });
            
            layer.openPopup();
        }
    });
   
    getSelectedValue(region);
}

      // Function to fetch data for a given object ID with retry mechanism
      async function fetchDataForObjectIDWithRetry(objectID) {
        const maxRetries = 3; // Maximum number of retries
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/find/${objectID}`);
                if (response.status === 429) {
                    const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                    console.log(`Too many requests. Retrying in ${waitTime / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retryCount++;
                    continue; // Retry the request
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Error fetching data for object ID ${objectID}:`, error);
                return null;
            }
        }
        console.error(`Max retries exceeded for object ID ${objectID}`);
        return null;
    }

    // Array of object IDs to fetch
    const objectIDs = [1, 2, 3, 4, 5, 6, 7, 8];

    // Function to fetch data for all object IDs and display them
    async function fetchAndDisplayData() {
        const dataContainer = document.getElementById('data-container');
        dataContainer.innerHTML = '';

        for (const objectID of objectIDs) {
            const data = await fetchDataForObjectIDWithRetry(objectID);
            if (data) {
                const dataHTML = `
                    <h2>Data for Object ID ${objectID}</h2>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
                dataContainer.innerHTML += dataHTML;
            } else {
                dataContainer.innerHTML += `<p>Error fetching data for object ID ${objectID}</p>`;
            }
        }
    }

    // Call the function