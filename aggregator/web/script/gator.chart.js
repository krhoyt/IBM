class Chart {
  constructor() {
    this.root = document.querySelector( 'gator-chart' );

    this.holder = document.createElement( 'div' );
    this.holder.style.width = `${this.root.clientWidth - 32}px`;
    this.holder.style.height = `${this.root.clientHeight - 32}px`;
    this.root.appendChild( this.holder );

    this.chart = Highcharts.chart( this.holder, {
      chart: {
        type: 'column',
        spacing: [8, 0, 0, 2]
      },
      credits: {
        enabled: false
      },
      title: {
        text: null
      },
      legend: {
        enabled: false
      },
      xAxis: {
        dateTimeLabelFormats: {
          day: '%e-%b'
        },
        labels: {
          style: {
            color: 'rgba( 0, 0, 0, 0.80 )',
            fontFamily: 'Plex-Text',
            fontSize: '14px'
          }
        }, 
        lineColor: 'rgba( 0, 0, 0, 0.06 )',        
        maxPadding: 0,
        minPadding: 0,
        tickLength: 0,
        type: 'datetime'
      },
      yAxis: {
        allowDecimals: false,
        gridLineColor: 'rgba( 0, 0, 0, 0.06 )',
        labels: {
          style: {
            color: 'rgba( 0, 0, 0, 0.80 )',
            fontFamily: 'Plex-Text',
            fontSize: '14px'
          }
        },
        maxPadding: 0,
        minPadding: 0,
        title: {
          text: null
        }
      },
      series: [{
        color: '#00bcd4',
        data: []
      }]
    } );
  }
 
  refine( data, start, end, field ) {
    start.setHours( 0 );
    start.setMinutes( 0 );
    start.setSeconds( 0 );
    start.setMilliseconds( 0 );

    end.setHours( 23 );
    end.setMinutes( 59 );
    end.setSeconds( 59 );
    end.setMilliseconds( 999 );

    let points = [];

    while( start < end ) {
      let day = new Date( start.getTime() );
      day.setHours( 23 );
      day.setMinutes( 59 );
      day.setSeconds( 59 );
      day.setMilliseconds( 999 );

      let xy = []
      xy.push( Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()  
      ) );

      let value = 0;

      for( let d = 0; d < data.length; d++ ) {
        let time = new Date( data[d][field] );

        if( time >= start && time <= day ) {
          value = value + 1;
        }
      }
      
      xy.push( value );

      points.push( xy );
      start.setDate( start.getDate() + 1 );
    }

    return points;
  }

  render( data, start, end, field ) {
    data = this.refine( data, start, end, field );
    this.chart.series[0].setData( data );
  }
}

Chart.SVG = 'http://www.w3.org/2000/svg';
