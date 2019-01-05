class Gator {
  constructor() {
    this.data = null;
    this.mode = 'blog';

    this.header = new Header();

    this.tabs = new Tabs();
    this.tabs.addEventListener( Tabs.CHANGE, ( evt ) => this.doTabsChange( evt ) );

    this.organization = new Organization();
    this.organization.addEventListener( Organization.LOAD, ( evt ) => this.doOrganizationLoad( evt ) );
    this.organization.addEventListener( Organization.CHANGE, ( evt ) => this.doOrganizationChange( evt ) );
    this.organization.load();

    this.version = new Version();

    this.chart = new Chart();

    this.categories = new List( document.querySelector( 'gator-list:first-of-type' ), 'Categories' );
    this.keywords = new List( document.querySelector( 'gator-list:last-of-type' ) );
  }

  render() {
    switch( this.mode ) {
      case 'blog':
        this.chart.render( 
          this.data.blog.posts, 
          new Date( this.data.start ), 
          new Date( this.data.end ), 
          'published_at' 
        );

        this.categories.title = 'Categories';
        this.categories.setList( this.data[this.mode].category );     

        this.keywords.title = 'Keywords';
        this.keywords.setList( this.data[this.mode].keywords ); 

        break;

      case 'twitter':
        this.chart.render( 
          this.data[this.mode].posts, 
          new Date( this.data.start ), 
          new Date( this.data.end ), 
          'published_at' 
        );

        this.categories.title = 'Mentions';
        this.categories.setList( this.data[this.mode].mentions, 'word', 'count', 'mentions' );

        this.keywords.title = 'Hashtags';
        this.keywords.setList( this.data[this.mode].hashtags );        

        break;

      case 'github':
        this.categories.title = 'Watchers';
        this.categories.setList( this.data[this.mode].watchers, 'name', 'watchers', 'watchers' );

        this.keywords.title = 'Repository';
        this.keywords.setList( this.data[this.mode].repository, 'word', 'count', 'events' );        

        break;
        
      case 'youtube':
        this.categories.title = 'Views';
        this.categories.setList( this.data[this.mode].sorted_views, 'title', 'views', 'views' );

        this.keywords.title = 'Stars';
        this.keywords.setList( this.data[this.mode].sorted_stars, 'title', 'stars', 'stars' ); 

        break;        

      case 'answers': 
        this.categories.title = 'Score';
        this.categories.setList( this.data[this.mode].sorted_score, 'title', 'score', 'score' );

        this.keywords.title = 'Accepted';
        this.keywords.setList( this.data[this.mode].sorted_accepted, 'title', 'accepted', 'accepted' ); 

        break;
    }
  }

  doOrganizationChange( evt ) {
    this.categories.clear();
    this.keywords.clear();

    let url = `${Gator.TEAM_SUMMARY}?id=${evt.id}`;

    if( evt.email ) {
      console.log( `Advocate: ${evt.id}` );
      url = `${Gator.ADVOCATE_SUMMARY}?id=${evt.id}`;      
    }

    fetch( url )
    .then( ( response ) => response.json() )
    .then( ( data ) => this.doSummaryLoad( data ) );    
  }

  doOrganizationLoad( evt ) {
    this.organization.setSelectedIndex( 0 );

    let item = this.organization.getSelectedItem();
    this.doOrganizationChange( item );
  }

  doSummaryLoad( data ) {
    console.log( data );

    this.data = data;

    this.render();
  }

  doTabsChange( evt ) {
    this.categories.clear();
    this.keywords.clear();

    this.mode = evt.mode;
    this.render();
  }
}

Gator.ADVOCATE_SUMMARY = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/gator/get.advocate.summary';
Gator.TEAM_SUMMARY = 'https://openwhisk.ng.bluemix.net/api/v1/web/krhoyt%40us.ibm.com_dev/gator/get.team.summary';

let app = new Gator();
