// Namespace
var Rats = {};

Rats.Constants = {

    "APP_SHORT_NAME" : "SG Rat Race",

    // Based on Bootstrap responsive design
    // @url http://twitter.github.com/bootstrap/scaffolding.html#responsive

    // Large desktops

    "LARGE_DESKTOP" : 1200,

    // Landscape tablet and regular desktop

    "DESKTOP" : 979,

    // Landscape phone to portrait tablet

    "TABLET" : 767,

    // Landscape phones and down

    "PHONE" : 480
};

Rats.getUserDevice = function() {
    var viewport = {
        "width" : $(window).width(),
        "height" : $(window).height()
    };

    if (viewport.width >= Rats.Constants.LARGE_DESKTOP) {
        return Rats.Constants.LARGE_DESKTOP;
    }

    if (viewport.width >= Rats.Constants.DESKTOP) {
        return Rats.Constants.DESKTOP;
    }

    if (viewport.width >= Rats.Constants.TABLET) {
        return Rats.Constants.TABLET;
    }

    return Rats.Constants.PHONE;

};

Rats.UI = {};

Rats.UI.LoadAnimation = {
    "start" : function() {
        var opts = {
            lines : 13, // The number of lines to draw
            length : 7, // The length of each line
            width : 4, // The line thickness
            radius : 10, // The radius of the inner circle
            corners : 1, // Corner roundness (0..1)
            rotate : 0, // The rotation offset
            color : '#000', // #rgb or #rrggbb
            speed : 1, // Rounds per second
            trail : 60, // Afterglow percentage
            shadow : false, // Whether to render a shadow
            hwaccel : false, // Whether to use hardware acceleration
            className : 'spinner', // The CSS class to assign to the spinner
            zIndex : 2e9, // The z-index (defaults to 2000000000)
            top : $(window).height() / 2.5, // Manual positioning in viewport
            left : "auto"

        };
        var target = $("body")[0];
        return new Spinner(opts).spin(target);
    },
    "stop" : function(spinner) {
        spinner.stop();
    }
};

Rats.Viz = {};

Rats.Viz.Occupation = {};

Rats.Viz.Occupation.Industry = {
    "dataSourceUrl" : "https://docs.google.com/spreadsheet/pub?key=0ArgBv2Jut0VxdHprczZyVzh6VWctLVVTSWNXcWRoaHc&headers=2&gid=5"
};

Rats.Viz.Occupation.Industry.query = function() {

    var query = new google.visualization.Query(Rats.Viz.Occupation.Industry.dataSourceUrl);

    // Group by occupation
    // Pivot age group
    // Do not filter by Data Suppressed = No (Column E)
    // because the data can be filtered by wage amount

    query.setQuery("select A, B, C, D, E, F, G, I, E/C " + "label A 'OCCUPATION', B 'SAMPLE SIZE #PERSONS', " + "C '25th Percentile', D 'Median', E '75th Percentile', " + "E/C '75th to 25th Percentile Wage Ratio' " + "format C '$#,###', D '$#,###', E '$#,###', E/C '#.##' ");

    query.send(Rats.Viz.Occupation.Industry.dashboard);
};

Rats.Viz.Occupation.Industry.dashboard = function(response) {
    var containerId = "dashboard";
    var data = response.getDataTable();

    // Create dashboard

    var dashboard = new google.visualization.Dashboard(document.getElementById(containerId));

    var selection = [];

    // Occupation filter is hidden at device size
    // of phone size and smaller
    // If occupation filter is visible
    // pre-select some values

    if (Rats.getUserDevice() > Rats.Constants.PHONE) {
        selection.push("Managing director/ Chief executive officer");
    }

    // Filter occupation

    var occupationControl = new google.visualization.ControlWrapper({
        "controlType" : "CategoryFilter",
        "containerId" : "control1",
        "options" : {
            "filterColumnLabel" : "OCCUPATION",
            "ui" : {
                "label" : "",
                "labelStacking" : "horizontal",
                "allowTyping" : true,
                "allowMultiple" : true,
                "selectedValuesLayout" : "aside",
                "caption" : "Start typing your occupation ..."
            },
        },
        "state" : {
            "selectedValues" : selection
        }
    });

    // Filter industry

    var industryControl = new google.visualization.ControlWrapper({
        "controlType" : "CategoryFilter",
        "containerId" : "control2",
        "options" : {
            "filterColumnLabel" : "INDUSTRY",
            "ui" : {
                "label" : "",
                "labelStacking" : "horizontal",
                "allowTyping" : false,
                "allowMultiple" : true,
                "selectedValuesLayout" : "aside",
                "caption" : "Industry"
            },
        }

    });

    // Filter occupational group

    var ogroupControl = new google.visualization.ControlWrapper({
        "controlType" : "CategoryFilter",
        "containerId" : "control3",
        "options" : {
            "filterColumnLabel" : "OCCUPATIONAL GROUP",
            "ui" : {
                "label" : "",
                "labelStacking" : "horizontal",
                "allowTyping" : false,
                "allowMultiple" : true,
                "selectedValuesLayout" : "aside",
                "caption" : "Occupational Group"
            },
        }

    });

    // Filter median wage

    var wageControl = new google.visualization.ControlWrapper({
        "controlType" : "NumberRangeFilter",
        "containerId" : "control4",
        "options" : {
            "filterColumnLabel" : "Median",
            "ui" : {
                "label" : "Median Wage ($)",
                "labelStacking" : "vertical",
                "unitIncrement" : 100,
                "blockIncrement" : 1000
            }
        }
    });

    // Column chart

    var chart = new google.visualization.ChartWrapper({
        "containerId" : "chart1",
        "chartType" : "ColumnChart",

        "options" : {
            "title" : "Median Monthly Gross Wage By Occupation and Industry",
            "vAxis" : {
                "title" : "",
                "textPosition" : "in",
                "textStyle" : {
                    "fontSize" : 16
                }
            },
            "hAxis" : {
                "title" : "",
                "textPosition" : "out",
                "textStyle" : {
                    "fontSize" : 11
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 12
                }
            },
            "chartArea" : {
                "width" : "100%",
                // Max height 65 to prevent hAxis labels from cropping
                "height" : "65%",
                // Min top 40 to show legend
                "top" : 40
            },

            "focusTarget" : "category",
            "isStacked" : false

        }

    });

    // Columns: Occupation, 25th percentile, median, 75th percentile

    chart.setView({
        'columns' : [7, 2, 3, 4]
    });

    var tableChart = new google.visualization.ChartWrapper({
        'chartType' : 'Table',
        'containerId' : 'chart2'
    });

    if (Rats.getUserDevice() <= Rats.Constants.TABLET) {

        // Columns: Industry, Occupation,
        // 25th percentile, Median, 75th percentile

        tableChart.setView({
            'columns' : [5, 0, 2, 3, 4]
        });
    } else {
        tableChart.setView({
            'columns' : [5, 6, 0, 2, 3, 4, 8, 1]
        });
    }

    // Register a listener to be notified once the dashboard is ready.
    google.visualization.events.addListener(dashboard, 'ready', dashboardReady);

    function dashboardReady() {
        $("#control-clearall").click(function() {
            occupationControl.setState({
                "selectedValues" : []
            });
            occupationControl.draw();
        });

        /*
         $("#control-haxis-label").click(function(){
         var viewColumns = chart.getView().columns;

         if ($.inArray(0, viewColumns) === 0) {
         chart.setView({
         'columns' : [ 5, 2, 3, 4 ]
         });
         $("#control-haxis-label").text("Toggle Horizontal Axis: Occupation");
         } else if ($.inArray(0, viewColumns) === -1) {
         chart.setView({
         'columns' : [ 0, 2, 3, 4 ]
         });
         $("#control-haxis-label").text("Toggle Horizontal Axis: Industry");
         }
         console.log(chart.getView().columns);
         chart.draw();
         });
         */
    };

    dashboard.bind([occupationControl, wageControl, industryControl, ogroupControl], [chart, tableChart]);

    dashboard.draw(data);
};

Rats.Viz.Occupation.Age = {
    dataSourceUrl : "https://docs.google.com/spreadsheet/pub?key=0ArgBv2Jut0VxdHprczZyVzh6VWctLVVTSWNXcWRoaHc&headers=2&gid=3"
};

Rats.Viz.Occupation.Age.query = function() {
    var query = new google.visualization.Query(Rats.Viz.Occupation.Age.dataSourceUrl);

    // Group by occupation
    // Pivot age group
    // Do not filter by Data Suppressed = No (Column E)
    // because the data can be filtered by wage amount

    query.setQuery("select A, sum(I), min(D), min(B) " + "group by A pivot F " + "label sum(I) '', min(D) ' (Median Monthly Wage $)', A 'Occupation', min(B) ' (Sample Size #persons)' " + "format sum(I) '$#,###', min(D) '$#,###', min(B) '#,###' ");

    query.send(Rats.Viz.Occupation.Age.dashboard);
};

Rats.Viz.Occupation.Age.dashboard = function(response) {
    var containerId = "dashboard";
    var data = response.getDataTable();

    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(document.getElementById(containerId));

    var selection = [];

    // Occupation filter is hidden at device size
    // of phone size and smaller
    // If occupation filter is visible
    // select default values

    if (Rats.getUserDevice() > Rats.Constants.PHONE) {

        /*
         selection.push("Carpenter",
         "Excavating/ Trench digging machine operator",
         "Lorry driver",
         "Crane/ Hoist operator",
         "Supervisor/ General foreman (building and related trades)",
         "Machinery mechanic",
         "Plasterer",
         "Welder");*/

        selection.push("Company director", "Hotel operations/ Lodging services manager", "Special education teacher", "Pre-primary education teacher", "Accountant", "Registered nurse", "Crane/ Hoist operator", "Bus driver", "Cleaner in offices and other establishments", "Financial/ Investment adviser");
    }

    // Filter by Occupation
    var occupationControl = new google.visualization.ControlWrapper({
        "controlType" : "CategoryFilter",
        "containerId" : "control1",
        "options" : {
            "filterColumnLabel" : "Occupation",
            "ui" : {
                "label" : "",
                "labelStacking" : "vertical",
                "allowTyping" : true,
                "allowMultiple" : true,
                "selectedValuesLayout" : "aside",
                "caption" : "Start typing your occupation ..."
            },
        },
        "state" : {
            "selectedValues" : selection
        }
    });

    // Range filter for wage in your twenties
    var wage20Control = new google.visualization.ControlWrapper({
        "controlType" : "NumberRangeFilter",
        "containerId" : "control2",
        "options" : {
            "filterColumnIndex" : 1,
            "ui" : {
                "label" : "Median pay in your 20s ($)",
                "labelStacking" : "vertical",
                "unitIncrement" : 100,
                "blockIncrement" : 1000
            }
        }
    });

    // Range filter for wage in your thirties
    var wage30Control = new google.visualization.ControlWrapper({
        "controlType" : "NumberRangeFilter",
        "containerId" : "control3",
        "options" : {
            "filterColumnIndex" : 2,
            "ui" : {
                "label" : "Median pay in your 30s ($)",
                "labelStacking" : "vertical",
                "unitIncrement" : 100,
                "blockIncrement" : 1000
            }
        }
    });

    // Range filter for wage in your forties
    var wage40Control = new google.visualization.ControlWrapper({
        "controlType" : "NumberRangeFilter",
        "containerId" : "control4",
        "options" : {
            "filterColumnIndex" : 3,
            "ui" : {
                "label" : "Median pay in your 40s ($)",
                "labelStacking" : "vertical",
                "unitIncrement" : 100,
                "blockIncrement" : 1000
            }
        }
    });

    // Range filter for wage in your fifties
    var wage50Control = new google.visualization.ControlWrapper({
        "controlType" : "NumberRangeFilter",
        "containerId" : "control5",
        "options" : {
            "filterColumnIndex" : 4,
            "ui" : {
                "label" : "Median pay in your 50s ($)",
                "labelStacking" : "vertical",
                "unitIncrement" : 100,
                "blockIncrement" : 1000
            }
        }
    });

    var chart = new google.visualization.ChartWrapper({
        "containerId" : "chart1",
        "chartType" : "ColumnChart",

        "options" : {
            "title" : "Median Monthly Gross Wage By Occupation and Age",
            "vAxis" : {
                "title" : "",
                "textPosition" : "in",
                "textStyle" : {
                    "fontSize" : 16
                }
            },
            "hAxis" : {
                "title" : "",
                "textPosition" : "out",
                "textStyle" : {
                    "fontSize" : 11
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 12
                }
            },
            "chartArea" : {
                "width" : "100%",
                "height" : "60%",
                // Min 40 to show legend on top
                "top" : 40
            },

            "focusTarget" : "category",
            "isStacked" : false

        }

    });

    // Columns: Occupation, 20s wage, 30s wage, 40s wage, 50s wage
    chart.setView({
        'columns' : [0, 1, 2, 3, 4]
    });

    var tableChart = new google.visualization.ChartWrapper({
        'chartType' : 'Table',
        'containerId' : 'chart2',
        "options" : {
            "allowHtml" : true
        }
    });

    tableChart.setView({
        'columns' : [0, 5, 6, 7, 8, 9, 10, 11, 12]
    });

    if (Rats.getUserDevice() <= Rats.Constants.TABLET) {

        // Columns: Industry, 20s wage, 30s wage
        // 40s wage, 50s wage

        tableChart.setView({
            'columns' : [0, 5, 6, 7, 8]
        });
    }

    // Register a listener to be notified once the dashboard is ready.
    google.visualization.events.addListener(dashboard, 'ready', dashboardReady);

    function dashboardReady() {
        $("#control-clearall").click(function() {
            occupationControl.setState({
                "selectedValues" : []
            });
            occupationControl.draw();
        });
    };

    dashboard.bind([occupationControl, wage20Control, wage30Control, wage40Control, wage50Control], [chart, tableChart]);

    dashboard.draw(data);
};

Rats.Viz.Macro = {};

Rats.Viz.Macro.Citizen = {
    dataSourceUrl : "https://docs.google.com/spreadsheet/pub?key=0ArgBv2Jut0VxdDVaYzczVzBpbGdOZWxORFlORzdmN3c&headers=2&gid=0"
};

Rats.Viz.Macro.Citizen.query = function() {
    var query = new google.visualization.Query(Rats.Viz.Macro.Citizen.dataSourceUrl);

    // Group by IHL and Post NS status
    // Pivot by year
    query.setQuery("select A, D, B, F, E, C, G " + "label D 'Income 20th Percentile', B 'Income Median', F 'Consumer Price Index', E 'Income 20th Percentile (%)', C 'Income Median (%)' " + "format B '$#,###', D '$#,###'");

    query.send(Rats.Viz.Macro.Citizen.chart);
};

Rats.Viz.Macro.Citizen.chart = function(response) {
    var data = response.getDataTable();

    var chart = new google.visualization.ChartWrapper({
        "containerId" : "chart1",
        "chartType" : "ComboChart",

        "options" : {
            "title" : "Gross Monthly Income from Work of Full-Time Employed Citizens (Excluding Employer CPF)",
            "vAxes" : {
                0 : {
                    "title" : "",
                    "textPosition" : "in"
                },
                1 : {
                    "title" : "Consumer Price Index (2009=100)",
                    "textPosition" : "out",
                    "format" : "###"
                }
            },
            "hAxis" : {
                "textPosition" : "out",
                "textStyle" : {
                    fontSize : 14
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "chartArea" : {
                // Max width to prevent vAxis 1 labels from cropping
                // at device screen width 800px and lower
                "width" : "90%",
                "height" : "80%",
                "left" : 0
            },

            "focusTarget" : "category",
            "isStacked" : false,

            "series" : {
                0 : {
                    "type" : "bars"
                },
                1 : {
                    "type" : "bars"
                },
                2 : {
                    "type" : "line",
                    "targetAxisIndex" : 1
                }
            }
        }

    });

    chart.setDataTable(data);
    chart.setView({
        'columns' : [0, 1, 2, 3]
    });
    chart.draw();

    var deltaChart = new google.visualization.ChartWrapper({
        "containerId" : "chart2",
        "chartType" : "LineChart",

        "options" : {
            "title" : "Nominal Change in Gross Monthly Income from Work of Full-Time Employed Citizens (Excluding Employer CPF)",
            "vAxis" : {

                "title" : "Change from Previous Year / Annual Inflation Rate (%)",
                "textPosition" : "in"

            },
            "hAxis" : {
                "textPosition" : "out",
                "textStyle" : {
                    fontSize : 14
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "chartArea" : {
                "width" : "95%",
                "height" : "80%",
                "left" : 0
            },

            "focusTarget" : "category"
        }

    });

    deltaChart.setDataTable(data);
    deltaChart.setView({
        'columns' : [0, 4, 5, 6]
    });
    deltaChart.draw();
};

Rats.Viz.Macro.Household = {
    dataSourceUrl : "//docs.google.com/spreadsheet/tq?key=0ArgBv2Jut0VxdDVaYzczVzBpbGdOZWxORFlORzdmN3c&headers=2&gid=2"
};

Rats.Viz.Macro.Household.query = function() {
    var query = new google.visualization.Query(Rats.Viz.Macro.Household.dataSourceUrl);

    // Group by decile
    // Pivot by year
    query.setQuery("select B, F, sum(C), sum(D) group by B, F pivot A label B 'Decile', F 'Employer CPF Contribution', sum(C) '', sum(D) '' format sum(C) '$#,###', sum(D) '$#,###' ");

    query.send(Rats.Viz.Macro.Household.dashboard);

    var query2 = new google.visualization.Query(Rats.Viz.Macro.Household.dataSourceUrl);

    // Group by year
    // Pivot by decile
    query2.setQuery("select A, E, F, sum(C), sum(D) group by A, E, F pivot B label A 'Year', E 'Consumer Price Index', F 'Employer CPF Contribution', sum(C) '', sum(D) '' format sum(C) '$#,###', sum(D) '$#,###' ");

    query2.send(Rats.Viz.Macro.Household.inflationDashboard);

};

Rats.Viz.Macro.Household.dashboard = function(response) {

    if (response.isError()) {
        console.log("[Rats.Viz.Macro.Household.dashboard] Error: " + response.getMessage() + "\n" + response.getDetailedMessage());
        return;
    }

    var containerId = "dashboard";
    var data = response.getDataTable();

    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(document.getElementById(containerId));

    var decileControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control1',
        'options' : {
            'filterColumnLabel' : 'Decile',
            'ui' : {
                'label' : '',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : true,
                'selectedValuesLayout' : 'aside',
                'caption' : 'Income Decile'
            }
        }
    });

    var employerContribControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control2',
        'options' : {
            'filterColumnLabel' : 'Employer CPF Contribution',
            'ui' : {
                'label' : 'Employer CPF Contribution',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : false,
                'selectedValuesLayout' : 'aside',
                'caption' : ''
            }
        },
        'state' : {
            'selectedValues' : ['Excluding']
        }
    });

    var chart = new google.visualization.ChartWrapper({
        "containerId" : "chart1",
        "chartType" : "ColumnChart",

        "options" : {
            "title" : "Average Monthly Household Income from Work",
            "vAxis" : {
                "title" : "",
                "textPosition" : "in"
            },
            "hAxis" : {
                "title" : "Income Decile",
                "textPosition" : "out",
                "textStyle" : {
                    "fontSize" : 11
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 12
                }
            },
            "chartArea" : {
                "width" : "100%",
                "height" : "80%",
                "top" : 40
            },

            "focusTarget" : "category",
            "isStacked" : false
        }

    });

    // Column 0: Decile,
    // Columns 2 - 15: Income figures from 2000 - 2013
    chart.setView({
        'columns' : [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    });

    var perMemberChart = new google.visualization.ChartWrapper({
        "containerId" : "chart2",
        "chartType" : "ColumnChart",

        "options" : {
            "title" : "Average Monthly Household Income from Work Per Household Member",
            "vAxis" : {
                "title" : "",
                "textPosition" : "in"
            },
            "hAxis" : {
                "title" : "Income Decile",
                "textPosition" : "out",
                'textStyle' : {
                    'fontSize' : 11
                }
            },
            'legend' : {
                'position' : 'top',
                'textStyle' : {
                    'fontSize' : 12
                }
            },
            'chartArea' : {
                "width" : "100%",
                "height" : "80%",
                "top" : 40
            },

            'focusTarget' : 'category',
            'isStacked' : false
        }

    });

    // Column 0: Decile,
    // Columns 16 - 29: Income figures from 2000 - 2013
    perMemberChart.setView({
        'columns' : [0, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
    });

    dashboard.bind([decileControl, employerContribControl], [chart, perMemberChart]);

    dashboard.draw(data);
};

Rats.Viz.Macro.Household.inflationDashboard = function(response) {
    var containerId = "dashboard2";
    var data = response.getDataTable();

    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(document.getElementById(containerId));

    // Column 0: Year
    // Column 1: CPI, 
    // Columns 3 - 12: 1st through 10th Decile
    var chartColumns = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // Columns 13 - 22: 1st through 10th Decile
    var perMemberChartColumns = [0, 1, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

    var yearControl = new google.visualization.ControlWrapper({
        'controlType' : 'NumberRangeFilter',
        'containerId' : 'control3',
        'options' : {
            'filterColumnLabel' : 'Consumer Price Index',
            'ui' : {
                'label' : 'Consumer Price Index',
                'labelStacking' : 'horizontal'

            }
        }
    });

    var employerContribControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control4',
        'options' : {
            'filterColumnLabel' : 'Employer CPF Contribution',
            'ui' : {
                'label' : 'Employer CPF Contribution',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : false,
                'selectedValuesLayout' : 'aside',
                'caption' : ''
            }
        },
        'state' : {
            'selectedValues' : ['Excluding']
        }
    });

    var chart = new google.visualization.ChartWrapper({
        "containerId" : "chart3",
        "chartType" : "ComboChart",

        "options" : {
            "title" : "Average Monthly Household Income from Work vs. Inflation",
            "vAxes" : {
                0 : {
                    "title" : "",
                    "textPosition" : "in"
                },
                1 : {
                    "title" : "Consumer Price Index (2009=100)",
                    "textPosition" : "out",
                    // Remove floating pt from axis labels
                    "format" : "###"
                }
            },
            "hAxis" : {
                "textPosition" : "out",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "legend" : {
                "position" : "none",
                "textStyle" : {
                    "fontSize" : 10
                }
            },
            "chartArea" : {
                // Max width to prevent cropping vAxis 1 labels
                // at device width lower than 1000px
                "width" : "90%",
                "height" : "85%",
                "left" : 0
            },

            "focusTarget" : "category",
            "isStacked" : false,
            "seriesType" : "bars",
            "series" : {
                // first series is CPI
                0 : {
                    "type" : "line",
                    "targetAxisIndex" : 1,
                    "color" : "red"
                },
                1 : {
                    "color" : "#6699cc"
                } // pale blue
            }/*
             "animation" : {
             "duration" : 1000,
             "easing" : "out"
             }*/
        }

    });

    chart.setView({
        'columns' : chartColumns
    });

    var perMemberChart = new google.visualization.ChartWrapper({
        "containerId" : "chart4",
        "chartType" : "ComboChart",

        "options" : {
            "title" : "Average Monthly Household Income from Work Per Household Member vs. Inflation",
            "vAxes" : {
                0 : {
                    "title" : "Average Monthly Income Per Household Member (S$)",
                    "textPosition" : "in"
                },
                1 : {
                    "title" : "Consumer Price Index (2009=100)",
                    "textPosition" : "out",
                    // Remove floating pt from axis labels
                    "format" : "###"
                }
            },
            "hAxis" : {
                "textPosition" : "out",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "legend" : {
                "position" : "none",
                "textStyle" : {
                    "fontSize" : 10
                }
            },
            "chartArea" : {
                // Max width to prevent cropping vAxis 1 labels
                // at device width lower than 1000px
                "width" : "90%",
                "height" : "85%",
                "left" : 0
            },
            "focusTarget" : "category",
            "isStacked" : false,
            "seriesType" : "bars",
            "series" : {
                // first series is CPI
                0 : {
                    "type" : "line",
                    "targetAxisIndex" : 1,
                    "color" : "red"
                },
                1 : {
                    "color" : "#6699cc"
                } // pale blue
            }/*
             "animation" : {
             "duration" : 1000,
             "easing" : "out"
             }*/
        }

    });

    perMemberChart.setView({
        'columns' : perMemberChartColumns
    });

    // Register a listener to be notified once the dashboard is ready.
    google.visualization.events.addListener(dashboard, 'ready', ready);

    dashboard.bind([yearControl,employerContribControl], [chart, perMemberChart]);

    dashboard.draw(data);

    function ready() {
        $("#control-decile").change(function() {

            var filter1 = [0, 1];
            var filter2 = [0, 1];

            var selectedIndex = parseInt($("#control-decile option:selected").val());

            if (selectedIndex > 1) {
                filter1.push(selectedIndex);
                chart.setView({
                    "columns" : filter1
                });

                filter2.push(selectedIndex + 10);
                perMemberChart.setView({
                    "columns" : filter2
                });

                chart.draw();
                perMemberChart.draw();

            } else {
                chart.setView({
                    "columns" : chartColumns
                });
                perMemberChart.setView({
                    "columns" : perMemberChartColumns
                });
                chart.draw();
                perMemberChart.draw();
            }

        });
    };
};

Rats.Viz.GraduateEmploymentSurvey = {};

Rats.Viz.GraduateEmploymentSurvey.Overview = {
    dataSourceUrl : "https://docs.google.com/spreadsheet/pub?key=0ArgBv2Jut0VxdDBVRGRWYXZKaG1IUVFTbFR1NFUwYmc&headers=2&gid=1"
};

Rats.Viz.GraduateEmploymentSurvey.Overview.query = function() {
    var query = new google.visualization.Query(Rats.Viz.GraduateEmploymentSurvey.Overview.dataSourceUrl);

    // Group by IHL and Post NS status
    // Pivot by year
    query.setQuery("select H, sum(D), sum(E) group by H pivot A " + "label sum(D) '', sum(E) '' " + "format sum(D) '$#,###', sum(E) '##.#%' ");

    query.send(Rats.Viz.GraduateEmploymentSurvey.Overview.dashboard);
};

Rats.Viz.GraduateEmploymentSurvey.Overview.dashboard = function(response) {
    var containerId = "dashboard";
    var data = response.getDataTable();

    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(document.getElementById(containerId));

    // Filter by Institution of Higher Learning, Timing of Employment
    var ihlControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control1',
        'options' : {
            'filterColumnLabel' : 'Chart Group',
            'ui' : {
                'label' : 'Institution of Higher Learning',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : true
            }
        }
    });

    var payChart = new google.visualization.ChartWrapper({
        "containerId" : "chart1",
        "chartType" : "ColumnChart",

        "options" : {
            "title" : "Median Monthly Gross Starting Salary of Graduates in Full-time Permanent Employment",
            "vAxis" : {
                "title" : "",
                "textPosition" : "in",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "chartArea" : {
                "width" : "100%",
                "height" : "70%",
                "top" : 40
            },

            "focusTarget" : "category",
            "isStacked" : false
        }

    });

    // Columns: IHL / Timing of Employment,
    // 2007 Pay, 2008 Pay, 2009 Pay, 2010 Pay, 2011 Pay, 2012 Pay
    payChart.setView({
        'columns' : [0, 1, 2, 3, 4, 5, 6]
    });

    var employmentRateChart = new google.visualization.ChartWrapper({
        "containerId" : "chart2",
        "chartType" : "ColumnChart",

        "options" : {
            "title" : "Employment Rate of Graduates From Institutions of Higher Learning (Full-Time Permanent)",
            "vAxis" : {
                "title" : "",
                "textPosition" : "in",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 14
                }
            },
            "chartArea" : {
                "width" : "100%",
                "height" : "70%",
                "top" : 40
            },

            "focusTarget" : "category",
            "isStacked" : false
        }

    });

    // Columns: IHL / Timing of Employment,
    // 2007 Rate, 2008 Rate, 2009 Rate, 2010 Rate, 2011 Rate, 2012 Rate
    employmentRateChart.setView({
        'columns' : [0, 7, 8, 9, 10, 11, 12]
    });

    dashboard.bind([ihlControl], [payChart, employmentRateChart]);

    dashboard.draw(data);
};

Rats.Viz.GraduateEmploymentSurvey.Qualification = {
    dataSourceUrl : "https://docs.google.com/spreadsheet/pub?key=0ArgBv2Jut0VxdERtWEU4UE5BbFd2TnZzVW8yTlB5eFE&headers=1&gid=0"
};

Rats.Viz.GraduateEmploymentSurvey.Qualification.query = function() {
    var query = new google.visualization.Query(Rats.Viz.GraduateEmploymentSurvey.Qualification.dataSourceUrl);

    query.setQuery("select L, A, H, B, I, C, F, E, G where J = 'No' " + "order by I, C " + "label C 'Employment Rate', F '25th Percentile', E 'Median', G '75th Percentile' " + "format F '$#,###', E '$#,###', G '$#,###', C '##.#%'");

    query.send(Rats.Viz.GraduateEmploymentSurvey.Qualification.dashboard);
};

Rats.Viz.GraduateEmploymentSurvey.Qualification.dashboard = function(response) {
    var containerId = "dashboard";
    var data = response.getDataTable();

    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(document.getElementById(containerId));

    // Filter degree name

    var qualificationControl = new google.visualization.ControlWrapper({
        "controlType" : "StringFilter",
        "containerId" : "control1",
        "options" : {
            // Do not filter by chart group
            // because it includes the year and school name
            "filterColumnLabel" : "Qualification",
            "matchType" : "any",
            "ui" : {
                "label" : "Degree",
                "labelStacking" : "horizontal",
                "realtimeTrigger" : true
            }
        }
    });

    // Filter by Year of Survey
    var yearControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control2',
        'options' : {
            'filterColumnLabel' : 'Year of Survey',
            'ui' : {
                'label' : '',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : true,
                'selectedValuesLayout' : 'aside',
                'caption' : 'Year of Survey'
            }
        },
        'state' : {
            'selectedValues' : ['2012']
        }
    });

    // Filter by Institution of Higher Learning
    var ihlControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control3',
        'options' : {
            'filterColumnLabel' : 'Institution',
            'ui' : {
                'label' : '',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : true,
                'selectedValuesLayout' : 'aside',
                'caption' : 'Institution of Higher Learning'
            }
        }
    });

    // Filter by Faculty within the Institution of Higher Learning
    var facultyControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control4',
        'options' : {
            'filterColumnLabel' : 'Faculty',
            'ui' : {
                'label' : '',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : true,
                'selectedValuesLayout' : 'aside',
                'caption' : 'Faculty'
            }
        }
    });

    var chart = new google.visualization.ChartWrapper({
        "containerId" : "chart1",
        "chartType" : "ComboChart",

        "options" : {
            "title" : "Monthly Gross Starting Salary and Employment Rate of University Graduates",
            "vAxes" : {
                0 : {
                    "title" : "",
                    "textPosition" : "in",
                    "textStyle" : {
                        "fontSize" : 16
                    }
                },
                1 : {
                    "title" : "Full-Time Permanent Employment Rate",
                    "textPosition" : "in",
                    "textStyle" : {
                        "fontSize" : 16
                    },
                    "minValue" : .5
                }
            },
            "hAxis" : {
                "textPosition" : "out",
                "textStyle" : {
                    "fontSize" : 11
                }
            },
            "legend" : {
                "position" : "top",
                "textStyle" : {
                    "fontSize" : 12
                }
            },
            "chartArea" : {
                "width" : "97%",
                // Max height for 8 hAxis labels to display horizontally
                "height" : "70%",
                "top" : 40,
                "left" : 0
            },

            "focusTarget" : "category",
            "isStacked" : false,

            "series" : {
                0 : {
                    "type" : "bars"
                },
                1 : {
                    "type" : "bars"
                },
                2 : {
                    "type" : "bars"
                },
                3 : {
                    "type" : "line",
                    "targetAxisIndex" : 1
                }
            }
        }

    });

    // Columns: IHL / Timing of Employment,
    // 2007 Pay, 2008 Pay, 2009 Pay, 2010 Pay, 2011 Pay, 2012 Pay
    chart.setView({
        'columns' : [0, 6, 7, 8, 5]
    });

    var tableChart = new google.visualization.ChartWrapper({
        'chartType' : 'Table',
        'containerId' : 'chart2'
    });

    if (Rats.getUserDevice() <= Rats.Constants.TABLET) {

        // Columns: Degree, IHL
        // 25th percentile, Median, 75th percentile

        tableChart.setView({
            'columns' : [1, 2, 6, 7, 8]
        });
    } else {
        tableChart.setView({
            'columns' : [1, 2, 3, 4, 5, 6, 7, 8]
        });
    }

    dashboard.bind([qualificationControl, ihlControl, yearControl, facultyControl], [chart, tableChart]);

    dashboard.draw(data);
};

Rats.Viz.GraduateEmploymentSurvey.Diploma = {
    dataSourceUrl : "https://docs.google.com/spreadsheet/pub?key=0ArgBv2Jut0VxdFU0OEMzbmR4Z0ZMQnJjU0EwTnViQnc&headers=1&gid=1"
};

Rats.Viz.GraduateEmploymentSurvey.Diploma.query = function() {
    var query = new google.visualization.Query(Rats.Viz.GraduateEmploymentSurvey.Diploma.dataSourceUrl);

    // Sort by course category
    // to maintain bubble color consistency

    query.setQuery("select A, B, C, D/100, E, F, G, H where I = 'No' " + "order by G " + "label D/100 'Employment Rate', E 'Median Salary' " + "format E '$#,###', D/100 '##.#%', B '#,###' ");

    query.send(Rats.Viz.GraduateEmploymentSurvey.Diploma.dashboard);
};

Rats.Viz.GraduateEmploymentSurvey.Diploma.dashboard = function(response) {
    var containerId = "dashboard";
    var data = response.getDataTable();

    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(document.getElementById(containerId));

    // Filter by Diploma Name
    var qualificationControl = new google.visualization.ControlWrapper({
        'controlType' : 'StringFilter',
        'containerId' : 'control1',
        'options' : {

            'filterColumnLabel' : 'Course',
            'matchType' : 'any',
            'ui' : {
                'label' : 'Diploma',
                'labelStacking' : 'horizontal',
                'realtimeTrigger' : true
            }
        }
    });

    // Filter by Year of Survey
    var yearControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control2',
        'options' : {
            'filterColumnLabel' : 'Year of Survey',
            'ui' : {
                'label' : 'Year of Survey',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : false,
                'selectedValuesLayout' : 'aside',
                'caption' : 'Everything'
            }
        },
        'state' : {
            'selectedValues' : ['2011']
        }
    });

    // Filter by Course Category (diploma groups)
    var courseCategoryControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control3',
        'options' : {
            'filterColumnLabel' : 'Course Category',
            'ui' : {
                'label' : 'Course Category',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : true,
                'selectedValuesLayout' : 'aside',
                'caption' : 'Everything'
            }
        }
    });

    // Filter by fresh graduate or post NS
    var postNSControl = new google.visualization.ControlWrapper({
        'controlType' : 'CategoryFilter',
        'containerId' : 'control4',
        'options' : {
            'filterColumnLabel' : 'Timing of Employment',
            'ui' : {
                'label' : 'Employment',
                'labelStacking' : 'horizontal',
                'allowTyping' : false,
                'allowMultiple' : false,
                'selectedValuesLayout' : 'aside',
                'caption' : 'Everything'
            }
        },
        'state' : {
            'selectedValues' : ['Fresh Graduate']
        }
    });

    var chart = new google.visualization.ChartWrapper({
        "chartType" : "BubbleChart",
        "containerId" : "chart1",
        "options" : {
            "title" : "Median Monthly Gross Starting Salary and Employment Rate of Polytechnic Graduates",
            "titlePosition" : "out",
            "axisTitlesPosition" : "out",
            "legend" : {
                "position" : "top",
                "alignment" : "left",
                "textStyle" : {
                    "fontSize" : 11
                }
            },
            "chartArea" : {
                "width" : "100%",
                "height" : "85%",
                "top" : 45
            },
            "hAxis" : {
                "title" : "Full-Time Permanent Employment Rate",
                "textPosition" : "in",
                "textStyle" : {
                    "fontSize" : 16
                },
                // min and max gridlines to minimize cropping
                "minValue" : .45,
                "maxValue" : 1
            },
            "vAxis" : {
                "title" : "",
                "textPosition" : "in",
                "textStyle" : {
                    "fontSize" : 16
                },
                // min 1600 to prevent low pay bubbles from cropping
                // max 2600 to prevent post NS bubbles from cropping
                "minValue" : 1400,
                "maxValue" : 2600
            },
            "sizeAxis" : {
                "minSize" : 10,
                "maxSize" : 80
            },
            "bubble" : {
                "textStyle" : {
                    "fontSize" : 10
                }
            },
            "tooltip" : {
                "textStyle" : {
                    "fontSize" : 14
                }
            }
        }
    });

    // Bubble ID: Course
    // X-coordinate: Employment Rate
    // Y-coordinate: Median Salary
    // Color: Course Category
    // Size:
    chart.setView({
        'columns' : [0, 3, 4, 6, 2]
    });

    var tableChart = new google.visualization.ChartWrapper({
        'chartType' : 'Table',
        'containerId' : 'chart2'
    });

    if (Rats.getUserDevice() <= Rats.Constants.TABLET) {

        // Columns: Degree, IHL
        // 25th percentile, Median, 75th percentile

        tableChart.setView({
            'columns' : [0, 1, 3, 4]
        });
    }

    dashboard.bind([qualificationControl, courseCategoryControl, yearControl, postNSControl], [chart, tableChart]);

    dashboard.draw(data);
};
