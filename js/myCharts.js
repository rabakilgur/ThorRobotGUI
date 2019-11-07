$(document).ready(() => {
	Chart.plugins.unregister(ChartDataLabels);


	// Bar Chart:
	var ctx1 = document.getElementById('myChart1').getContext('2d');
	var gradient_blue = ctx1.createLinearGradient(0, 0, 0, 400);
	gradient_blue.addColorStop(0, "#0088FF");
	gradient_blue.addColorStop(1, "#0170FE");
	var gradient_yellow = ctx1.createLinearGradient(0, 0, 0, 400);
	gradient_yellow.addColorStop(0, "#F1C40F");
	gradient_yellow.addColorStop(1, "#F5AF41");
	var gradient_red = ctx1.createLinearGradient(0, 0, 0, 400);
	gradient_red.addColorStop(0, "#FF4E3F");
	gradient_red.addColorStop(1, "#E84C3D");
	var gradient_green = ctx1.createLinearGradient(0, 0, 0, 400);
	gradient_green.addColorStop(0, "#00BA47");
	gradient_green.addColorStop(1, "#00BA47");
	var gradient_orange = ctx1.createLinearGradient(0, 0, 0, 400);
	gradient_orange.addColorStop(0, "#FF8030");
	gradient_orange.addColorStop(1, "#FF5722");
	var gradient_brown = ctx1.createLinearGradient(0, 0, 0, 400);
	gradient_brown.addColorStop(0, "#D6AA75");
	gradient_brown.addColorStop(1, "#C49863");
	var myChart1 = new Chart(ctx1, {
		type: 'bar',
		data: {
			labels: ['Blue', 'Yellow', 'Red', 'Green', 'Orange', 'Brown'],
			datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2, 3],
				backgroundColor: [
					gradient_blue,
					gradient_yellow,
					gradient_red,
					gradient_green,
					gradient_orange,
					gradient_brown
				],
				borderWidth: 0
			}]
		},
		options: {
			legend: {
				display: false
			},
			cornerRadius: 3,
			scales: {
				xAxes: [{
					ticks: {
						fontColor: "#EEE",
						fontSize: 16
					},
					gridLines: {
						display: false
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						fontColor: "#888",
						padding: 8,
						fontSize: 16
					},
					gridLines: {
						lineWidth: 2,
						color: "#FFFFFF22",
						zeroLineWidth: 2,
						zeroLineColor: "#FFFFFF22",
						drawBorder: false,
						drawTicks: false
					}
				}]
			},
			animation: {
				easing: "easeOutQuint"
			}
		}
	});



	// Line Chart
	var ctx2 = document.getElementById('myChart2').getContext('2d');
	var gradient_blueTrans = ctx2.createLinearGradient(0, 0, 0, 400);
	gradient_blueTrans.addColorStop(0, "#0088FF");
	gradient_blueTrans.addColorStop(1, "transparent");
	var myChart2 = new Chart(ctx2, {
		type: 'line',
		data: {
			labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
			datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2, 5, 7, 10, 15, 17],
				borderColor: "#0088FF",
				borderWidth: 4,
				pointBackgroundColor: "#0088FF",
				pointBorderColor: "#161616",
				pointBorderWidth: 3,
				pointHoverBorderWidth: 3,
				pointRadius: 6,
				pointHoverRadius: 6,
				backgroundColor: gradient_blueTrans
			}]
		},
		options: {
			legend: {
				display: false
			},
			scales: {
				xAxes: [{
					ticks: {
						fontColor: "#EEE",
						fontSize: 16
					},
					gridLines: {
						display: false
					},
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						max: 20,
						fontColor: "#888",
						padding: 8,
						fontSize: 16
					},
					gridLines: {
						lineWidth: 2,
						color: "#FFFFFF22",
						zeroLineWidth: 2,
						zeroLineColor: "#FFFFFF22",
						drawBorder: false,
						drawTicks: false
					}
				}]
			},
			animation: {
				easing: "easeOutQuint"
			},
			tooltips: {
				intersect: false
			}
		}
	});
	function updateData(chart, new_data) {
		chart.data.datasets[0].data.push(new_data);
		chart.update();
		chart.data.datasets[0].data.shift();
		chart.update();
	}
	setInterval(() => {  // For the Demo
		let new_val = Math.min(Math.max(myChart2.data.datasets[0].data[myChart2.data.datasets[0].data.length - 1] + Math.floor(Math.random() * 21 - 10), 0), 20);
		updateData(myChart2, new_val);
	}, 2000);



	// Horizontal Bar Chart
	var ctx3 = document.getElementById('myChart3').getContext('2d');
	var gradient_RedOrange = ctx3.createLinearGradient(0, 0, 600, 0);
	gradient_RedOrange.addColorStop(0, "#D72059");
	gradient_RedOrange.addColorStop(1, "#EA8E01");
	var myChart3 = new Chart(ctx3, {
		plugins: [ChartDataLabels],
		type: 'horizontalBar',
		data: {
			labels: ['Motor 1', 'Motor 2', 'Motor 3', 'Motor 4'],
			datasets: [{
				label: '# of Votes',
				data: [65, 24, 42, 98],
				backgroundColor: gradient_RedOrange,
				borderWidth: 0
			}]
		},
		options: {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "right",
					color: "#FFFFFFcc",
					font: {
						size: 18,
						style: "bold"
					},
					formatter: function(value, context) {
						return value + '%';
					}
				}
			},
			cornerRadius: 6,
			tooltips: {
				enabled: false
			},
			legend: {
				display: false
			},
			scales: {
				xAxes: [{
					ticks: {
						beginAtZero: true,
						max: 108,
						display: false
					},
					gridLines: {
						display: false
					}
				}],
				yAxes: [{
					ticks: {
						fontColor: "#FFF",
						padding: 8,
						fontSize: 18
					},
					gridLines: {
						display: false
					}
				}]
			},
			animation: {
				easing: "easeOutQuint"
			}
		}
	});
});