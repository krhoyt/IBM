class Chart {
  constructor( title = 'Last 30 Days' ) {
    this.name = null;

    this.root = document.querySelector( 'gator-chart' );

    this.header = document.createElement( 'div' );

    this.label = document.createElement( 'p' );
    this.label.innerHTML = title;
    this.header.appendChild( this.label );

    this.sub = document.createElement( 'p' );
    this.header.appendChild( this.sub );

    this.root.appendChild( this.header );

    this.holder = document.createElement( 'div' );
    this.holder.style.width = `${this.root.clientWidth - 32}px`;
    this.holder.style.height = `${this.root.clientHeight - this.header.clientHeight - 32}px`;
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
        name: this.name,        
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
 
  get title() {
    return this.label.innerHTML.trim();
  }

  set title( value ) {
    this.label.innerHTML = value;
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
    this.chart.series[0].name = this.name;
  }

  getSubtitle() {
    let result = {
      count: parseInt( this.sub.getAttribute( 'data-count ' ) ),
      unit: this.sub.getAttribute( 'data-unit' )
    };

    return result;
  }

  setSubtitle( count, unit ) {
    this.sub.setAttribute( 'data-count', count );
    this.sub.setAttribute( 'data-unit', unit );
    this.sub.innerHTML = `${count} ${unit}`;
  }
}

Chart.SVG = 'http://www.w3.org/2000/svg';
