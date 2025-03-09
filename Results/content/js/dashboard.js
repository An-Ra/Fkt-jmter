/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 36.45454545454545, "KoPercent": 63.54545454545455};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3259090909090909, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.975, 500, 1500, "HTTP Request 100-120"], "isController": false}, {"data": [0.6, 500, 1500, "HTTP Request 100-30"], "isController": false}, {"data": [0.09, 500, 1500, "HTTP Request 100-1"], "isController": false}, {"data": [0.595, 500, 1500, "HTTP Request 100-60"], "isController": false}, {"data": [0.13, 500, 1500, "HTTP Request 100-5"], "isController": false}, {"data": [0.239, 500, 1500, "HTTP Request 500-150"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request 100-15"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1100, 699, 63.54545454545455, 338.8527272727277, 90, 2567, 109.0, 489.4999999999999, 1821.95, 2313.99, 2.640073922069818, 11.794598217500091, 6.091539313100768], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["HTTP Request 100-120", 100, 0, 0.0, 388.34999999999997, 306, 635, 370.0, 465.9, 510.4499999999999, 634.7099999999998, 0.8389824820457749, 0.29167750352372646, 1.9370663509295927], "isController": false}, {"data": ["HTTP Request 100-30", 100, 40, 40.0, 239.62999999999994, 91, 453, 303.0, 347.40000000000003, 367.4499999999999, 452.5899999999998, 3.355141754739138, 9.867393264552927, 7.7393683945646705], "isController": false}, {"data": ["HTTP Request 100-1", 100, 52, 52.0, 1852.44, 972, 2567, 1837.5, 2314.9, 2410.3999999999996, 2566.7599999999998, 32.4254215304799, 120.61750162127107, 74.81532709143968], "isController": false}, {"data": ["HTTP Request 100-60", 100, 40, 40.0, 248.73999999999995, 100, 559, 301.0, 415.9000000000001, 444.9, 558.0499999999995, 1.680644022789533, 4.942488492840456, 3.8692889615300583], "isController": false}, {"data": ["HTTP Request 100-5", 100, 87, 87.0, 134.26000000000005, 93, 403, 103.0, 326.30000000000007, 346.95, 402.67999999999984, 19.011406844106464, 113.83042716254754, 43.9453125], "isController": false}, {"data": ["HTTP Request 500-150", 500, 380, 76.0, 152.3079999999999, 90, 632, 103.0, 307.90000000000003, 317.95, 372.7900000000002, 3.3378951233352248, 17.60731854367636, 7.7016192963717085], "isController": false}, {"data": ["HTTP Request 100-15", 100, 100, 100.0, 102.42000000000003, 90, 140, 101.0, 110.0, 113.94999999999999, 139.90999999999997, 6.688068485821295, 45.686953459403426, 15.432195525682182], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["429/Too Many Requests", 699, 100.0, 63.54545454545455], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1100, 699, "429/Too Many Requests", 699, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["HTTP Request 100-30", 100, 40, "429/Too Many Requests", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request 100-1", 100, 52, "429/Too Many Requests", 52, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request 100-60", 100, 40, "429/Too Many Requests", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request 100-5", 100, 87, "429/Too Many Requests", 87, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request 500-150", 500, 380, "429/Too Many Requests", 380, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request 100-15", 100, 100, "429/Too Many Requests", 100, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
