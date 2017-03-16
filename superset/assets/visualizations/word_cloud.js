/* eslint-disable  no-use-before-define */
import d3 from 'd3';
import cloudLayout from 'd3-cloud';
import { category21 } from '../javascripts/modules/colors';

function wordCloudChart(slice) {
  function refresh() {
    const chart = d3.select(slice.selector);
    d3.json(slice.jsonEndpoint(), function (error, json) {
      if (error !== null) {
        slice.error(error.responseText, error);
        return;
      }
      const data = json.data;
      const range = [
        json.form_data.size_from,
        json.form_data.size_to,
      ];
      const rotation = json.form_data.rotation;
      let fRotation;
      if (rotation === 'square') {
        fRotation = () => ~~(Math.random() * 2) * 90;
      } else if (rotation === 'flat') {
        fRotation = () => 0;
      } else {
        fRotation = () => (~~(Math.random() * 6) - 3) * 30;
      }
      const size = [slice.width(), slice.height()];

      const scale = d3.scale.linear()
      .range(range)
      .domain(d3.extent(data, function (d) {
        return d.size;
      }));

      function draw(words) {
        chart.selectAll('*').remove();

        chart.append('svg')
        .attr('width', layout.size()[0])
        .attr('height', layout.size()[1])
        .append('g')
        .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', (d) => d.size + 'px')
        .style('font-family', 'Impact')
        .style('fill', (d) => category21(d.text))
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
        .text((d) => d.text);
      }

      const layout = cloudLayout()
      .size(size)
      .words(data)
      .padding(5)
      .rotate(fRotation)
      .font('serif')
      .fontSize((d) => scale(d.size))
      .on('end', draw);

      layout.start();
      slice.done(json);
    });
  }

  return {
    render: refresh,
    resize: refresh,
  };
}

module.exports = wordCloudChart;