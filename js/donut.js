'use strict';

        var width = 800;
        var height = 400;


        var scale = d3.scale.linear()
                .range([0,180]);


        var chartSVG = d3.select('#chart')
                .append('svg').attr({
                    'width': width,
                    'height': height
                })
                .append('g')
                .attr({
                    'transform':'translate('+ width/2 + ',' + height/2 + ')'
                });

        var chartCenterInfo = chartSVG.append('text')
                .attr({
                    'class':'center_text',
                    'transform':'translate(0,0)'
                });

        var arc = d3.svg.arc()
                .innerRadius(90)
                .outerRadius(140)
                .padAngle(.02);

        var arcHover = d3.svg.arc()
                .innerRadius(90)
                .outerRadius(150)
                .padAngle(.02);

        var lineX = function(d){ return arc.centroid(d)[0]};
        var lineY = function(d){ return arc.centroid(d)[1]};
        var ratio = 1.3;
        var offset = 40;




        var pie = d3.layout.pie()
                .value(function(d){ return d.count;})
                .sort(null);

//        pie.startAngle(Math.PI * 1.5)
//                .endAngle(Math.PI * 2.5);
//        .padAngle(.05);

        var color = d3.scale.linear()
                .range(['#D9CD90','#FFB11B']);


        d3.select('#chart').append("div").attr("class","progress").html('waiting');

        d3.csv('../mockdata/donut_text.csv')

                .get(function(error, dataset){
                    if(error){console.log('weekday.csv error');}

                    d3.select('#chart').selectAll('.progress').style("display","none");

                    var maxValue = d3.sum(dataset, function(d){return d.count});
                    scale.domain([0, maxValue]);
                    color.domain([1,dataset.length-1]);
                    chartCenterInfo.text('Chart');
                    var chartGroup = chartSVG.selectAll('path')
                        .data(pie(dataset))
                        .enter()
                        .append('g')
                        .on('mouseover', function(){
                                var _this = d3.select(this);
                                _this.select('.arc_path')
                                        .transition()
                                        .duration(300)
                                        .ease('plastic')
                                        .attr({
                                            'd':arcHover
                                        })
                                        .style({'opacity':'.8'});
                                _this.select('.label_line')
                                        .style({
                                            'stroke':'#fff'
                                        });

                                chartCenterInfo
                                        .transition()
                                        .duration(300)
                                        .ease('plastic')
                                        .text(_this[0][0].__data__.data.count);
                            })
                            .on('mouseout', function(){
                                var _this = d3.select(this);

                                _this.select('.arc_path')
                                        .interrupt()
                                        .transition()
                                        .duration(300)
                                        .ease('plastic').attr({
                                            'd':arc
                                        })
                                        .style({'opacity':'1'});
                                _this.select('.label_line')
                                        .style({
                                            'stroke':'#aaa'
                                        });
                                chartCenterInfo
                                        .interrupt()
                                        .transition()
                                        .duration(300)
                                        .ease('plastic')
                                        .text("Chart");
                            });

                    chartGroup.append('path')
                            .attr({
                                'class':'arc_path',
                                'd': arc,
                                'id':function(d,i){return 'pie_' + i},
                                'fill':function(d,i){
                                    return color(i);}
                            });

                    chartGroup.append('text')
                            .attr({
                                'text-anchor': function(d){
                                    return lineX(d)<0 ? 'end':'start'
                                },
                                'transform': function(d){
                                    var x = lineX(d)<0 ? lineX(d)*ratio - (offset+5) : lineX(d)*ratio + (offset+5);
                                    return 'translate('+ x + ',' + lineY(d)*ratio +')'
                                }
                            })
                            .text(function(d){  return d.data.label });


                    //label
                    chartGroup.append('path')
                                .attr({
                                'class':'label_line',
                                'd': function(d){
                                    var x = lineX(d)<0 ? lineX(d)*ratio - offset : lineX(d)*ratio + offset;

                                        return 'M'+lineX(d)+' '+ lineY(d) +
                                                'Q' + lineX(d)*ratio + ' ' + lineY(d)*ratio + ' '+ x + ' ' + lineY(d)*ratio;
                                }
                            });


                    chartGroup.append('circle')
                            .attr({
                                'transform': function(d){  return 'translate('+ lineX(d) + ',' + lineY(d) +')'}
                            });




                });