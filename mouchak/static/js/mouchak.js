(function(M) {
/*
 * */

var types;
M.types = types = {};


/* The master view of the entire app */
var AppView = Backbone.View.extend({
  el: 'body',
  events: {
  },
  initialize: function() {
    _.bindAll.apply(_, [this].concat(_.functions(this)));
  },
  render: function() {
    var menu = new M.types.model.menu(M.site_content.menu);
    var navView = new NavigationView({model: menu});
    navView.render();
    this.navView = navView;
  },
  updateBreadcrumbs: function(event) {
    //TODO: write code to use bootstrap's breadcrumbs to render a
    // navigational breadcrumb
  }
});


var NavigationView = Backbone.View.extend({
  el: '#navigation',
  events: {
    'click .nav li a' : 'navClicked',
    'navclicked': 'navClicked'
  },
  initialize: function() {
    _.bindAll.apply(_, [this].concat(_.functions(this)));
    this.template = _.template($('#nav-bar-template').html());
    this.bind('navclicked', this.navClicked);
  },
  render: function() {
    // if custom menu is not defined, render a default menu
    //console.log(this.model.toJSON());
    if(this.model.get('customMenu') === false) {
      //console.log('generating default menu..');
      var startpage = M.site_content.menu.menuOrder[0];
      this.$el.append(this.template({
        brand: document.title,//brand name,
        brand_href: '#/' + startpage //link to the brand page
      }));
      this.$ul = $('.nav');
      this.populate();
    }
    // else render the custom menu
    else {
      //console.log('rendering custom menu..');
      this.$el.append(this.model.get('html'));
    }
    this.$links = $('.nav > li');
    if(!this.$links) {
      throw new Error('Ill-formed menu! Please check you have <ul> element' +
          'inside your menu with class nav and <li> elements inside it');
      alert('Error in Menu: Please check console for details');
    }
    var fragment = location.hash.split('/')[1];
    var pos = _.indexOf(M.pages.models, M.pages.where({'name': fragment})[0]);
    if(!fragment) {
      pos = 0;
    }
    $(this.$links[pos]).addClass('active');
  },
  populate: function() {
    var item_template = _.template($('#nav-item-template').html());
    _.each(this.model.get('menuOrder'), function(page) {
      this.$ul.append(item_template({
        cls: '',
        page: page
      }));
      //console.log('no children?', _.isEmpty(page.get('children')));
      /*this.$ul.append(item_template({
        cls: (_.isEmpty(page.get('children'))) ? '' : 'dropdown',
        page: page.get('name')
      }));*/
    }, this);
  },
  //FIXIT: sometimes clicking on nav link, this function does not handle the
  //event directly. it is passed to showPage function of router, which calls
  //this function. so this function is without an event object is some cases.
  //Fix it always receive the click event.
  navClicked: function(event) {
    this.$links.removeClass('active');
    if(this.model.get('customMenu') === false) {
      if(!event) {
        var fragment = location.hash.split('/')[1];
        //var pos = _.indexOf(M.pages.models, M.pages.where({'name': fragment})[0]);
        var pos = _.indexOf(this.model.get('menuOrder'), fragment);
        if(!fragment) {
          pos = 0;
        }
        $(this.$links[pos]).addClass('active');
      }
      else {
        $(event.currentTarget).parent().addClass('active');
      }
    }
    else if(this.model.get('customMenu') === true) {
      // get the URL fragment
      var fragment = location.hash.split('/')[1];
      // find out where it is in the nav menu
      var link = $('.nav').find('a[href="#/'+ fragment +'"]')[0];
      // find its <li> parent all the way up in the main ul.nav
      $(link).closest('ul.nav > li').addClass('active');
    }
  }
});

var AppRouter = Backbone.Router.extend({
  routes : {
    ':page' : 'showPage'
  },
  showPage: function(page, params) {
    $('.pageview').hide();
    //news pages are rendered on the fly,
    //as feeds have to be fetched.
    /*if(page === 'news') {
      M.rss_view.render();
     }*/
    M.params = params;
    var id = nameIdMap[page];
    if(!id) {
      this.render404();
      return;
    }
    $('#'+id).show();
    $('.'+page).show();
    if(M.pages.get(id).get('showNav') === false) {
      $('#navigation').hide();
    }
    else {
      $('#navigation').show();
    }
    //console.log('navclicked');
    M.appView.navView.trigger('navclicked');
  },
  render404: function() {
    $('.pageview').hide();
    var notFound = "Sorry, a page corresponding to your URL was not found.\n" +
      "Maybe you have typed the URL wrong, or this page is no longer available.";
    alert(notFound);
  }
});

/*Sweet swagger widget view */ 
var SweetsView = Backbone.View.extend({
  el: document,

  initialize: function() {
    var self = this;
    this.sweets = []; //to save local context of the sweets fetched from Sweet Store in a array- has sweets from User bhanu
    this.pradeepSweets = []; 
    this.guestSweets = []; 
    this.amraSweets = []; 
    //Ajax request to fetch Sweets from sweet store using the api's Who, what,
    //where and How
    $.ajax({url: "http://teststore.swtr.us/api/sweets/q?what=img-anno&who=bhanu",
      success: function(resp) {console.log('done..bhanu sweets', resp);
        self.sweets = resp;
      }
    });
    $.ajax({url: "http://teststore.swtr.us/api/sweets/q?what=img-anno&who=Guest",
      success: function(resp) {console.log('done..Guest  sweets', resp);
        self.guestSweets = resp;
        self.interactiveSweets();
      }
    });
    $.ajax({url: "http://teststore.swtr.us/api/sweets/q?what=img-anno&who=pradeep",
      success: function(resp) {console.log('done..Pradeep sweets', resp);
        self.pradeepSweets =resp;
      }
    });
    $.ajax({url: "http://teststore.swtr.us/api/sweets/q?what=img-anno&who=Amrapali",
      success: function(resp) {console.log('done.. Amrapali Sweets', resp);
        self.amraSweets = resp;
      }
    });

  },

  interactiveSweets: function() { 
    var self = this;
    // simple Demo Widget...
      template =  _.template($("#store-template").html()); // template from index.html
      _.each(self.sweets, function(swt) {
       if(_.contains(swt.how.tags, "lolcat")) {
          $("#sweetWidget").append(_.template(template(swt))); // filtered response will be appended to DOM
       }
      }, self.sweets);
      _.each(self.sweets, function(swt) {
       if(_.contains(swt.how.tags, "CulturalContent")){
          $("#mysoredusseraB-store").append(_.template(template(swt))); // filtered response will be appended to DOM
       }
      }, self.sweets);
         
      _.each(self.sweets, function(swt) {
       if(_.contains(swt.how.tags, "Tradition")){
          $("#mysoredusseraB1-store").append(_.template(template(swt))); // filtered response will be appended to DOM
       }
      }, self.sweets);
//section 1 of narrative
   $('#section1').waypoint(function(direction) {// waypoint is jquery plug in, to check for scroll position to display sweets in the widget
      console.log("insec1");
      var response,
      filterResp,
      template =  _.template($("#store-template").html()); 
      filterResp = _.filter(self.sweets, function(swt) { return swt.how.comment});
      _.each(filterResp, function(swt) { 
        if(_.contains(swt.how.tags, "GirijaKalyanaStory")) { // to filter sweets with Tags
          $("#sectionA-store").append(_.template(template(swt))); // filtered response will be appended to DOM
        }
      }, filterResp);
    }, {
      triggerOnce: true
    });
    $('#section1c').waypoint(function(direction) {
      var response,
      filterResp,
      template =  _.template($("#store-template").html());
      filterResp = _.filter(self.sweets, function(swt) { return swt.how});
      _.each(filterResp, function(swt) { 
        if(_.contains(swt.how.tags, "ManmathaKonda")) {
          $("#sectionA1-store").append(_.template(template(swt)));
        }
      }, filterResp);
    }, {
      triggerOnce: true
    });
    //section 2 of narrative
    $('#section2c').waypoint(function(direction) {
      console.log("insec2c");
      var response,
      filterResp,
      template =  _.template($("#store-template").html());
     console.log(self.anotherSweets);
      filterResp = _.filter(self.pradeepSweets, function(swt) { return swt.how});
      _.each(filterResp, function(swt) { 
         console.log(swt);
          $("#sectionB-store").append(_.template(template(swt))); // filtered response will be appended to DOM
      }, filterResp);
    }, {
      triggerOnce: true
    });
    $('#section2').waypoint(function(direction) {
      console.log("in sec2");
      var response,
      filterResp,
      template =  _.template($("#store-template").html());
        filterResp = _.filter(self.guestSweets, function(swt) { return swt.how});
        _.each(filterResp, function(swt){ // text search to find hampi in comments
          var str = swt.how.text, keyword = "Hampi";
          if(typeof(str) == "string"){ 
            if(str.search(keyword)==-1){
              console.log(swt, "no hampi");   
        }
            else{
              console.log(swt, "hampi found");
          $("#sectionB1-store").append(_.template(template(swt))); // filtered response will be appended to the DOM
        }
          }
        }, filterResp);
    }, {
      triggerOnce: true
    });
    //last section of narrative: to filter Sweets with word "hampi" - using
    //Sweets from User Amrapali
    $('#section3').waypoint(function(direction) {
      console.log("insec3");
      var response,
      filterResp,
      template =  _.template($("#lastStore-template").html());
      filterResp = _.filter(self.amraSweets, function(swt) { return swt.how.text});
      _.each(filterResp, function(swt) {
       var str = swt.how.text, keyword = "hampi";
       if(typeof(str) == "string"){ 
        if(str.search(keyword)==-1){
          console.log("no hampi");
          
        }
        else{
          console.log("hampi found");
          $("#section3-store").append(_.template(template(swt)));
        }}
      }, filterResp);
    }, {
      triggerOnce: true
    });
  }
 
});
// hashmap to maintain one-to-one lookup among page ids and
// their names
var nameIdMap = {};

// initialize the app
M.init = function() {
	M.tags = {}; //global tag cache

  // global collection of pages
  M.pages = new types.model.Pages(M.site_content.content);

  // iterate through pages to get their content and render them using views and
  // models
  _.each(M.pages.models, function(page) {
    var contents = [];
    _.each(page.get('content'), function(content, idx) {
      // empty content!
      if(_.isEmpty(content)) {
        console.log('NOTICE: Empty content for ' + page.get('name') + ' at ' +
          idx);
        return;
      }

      var ContentModel = types.model[content.type];
      if(!ContentModel) {
        throw new Error('Invalid type. Not a Mouchak type: ' + content.type);
        return;
      }
      var contentmodel = new ContentModel(content);
      contents.push(contentmodel);
      //index the tags in the content
      M.createTagList(content, contentmodel);
    });

    page.set({content: contents});
    var pageview = new types.view.PageView({model: page, id: page.id});

    // prepare the name to id map
    nameIdMap[page.get('name')] = page.id;
  });

  M.appView = new AppView();
  M.appView.render();

  var app_router = new AppRouter();
  Backbone.history.start();

  if(!window.location.hash) {
    var startpage = '#/' + M.site_content.menu.menuOrder[0];
    //console.log(startpage);
    app_router.navigate(startpage, {trigger: true});
  }
  M.app_router = app_router;
  M.sweetsView = new SweetsView();
  //M.simHeir();
};

// hack to simulate heirarchy among the page views
// basically add the parent id as class in all of its children
// elements.
M.simHeir = function() {
  _.each(M.pages.models, function(page) {
    if(page.id == 'index') return;
    _.each(page.get('children'), function(child) {
      child = M.sanitize(child);
      $('#'+child).addClass(page.id);
    });
  });
};


// append attributes to elements from the model
M.appendAttrs = function(model, el) {
  _.each(model.get('attr'), function(val, key) {
    $(el).attr(key, val);
  });
};

// create the list of tags and associate the objects with related tags
M.createTagList = function(content, model) {
  for(var i in content.tags) {
    if(!M.tags[content.tags[i]]) {
      M.tags[content.tags[i]] = [];
    }
    M.tags[content.tags[i]].push(model);
  }
};

// Filter the tags and return only those "content" objects which match a given tag.
// @tags should be an array
M.filterTags = function(tags) {
	if(!_.isArray(tags)) {
    //console.log('You have to pass an array'); //TODO: raise an exception
    throw new Error(' accepts only an array of strings');
    return false;
  }
  var list = [];
  _.each(tags, function(item) {
    if(M.tags[item]) {
      list.push(M.tags[item]);
    }
  });
  return _.uniq(_.flatten(list));
};

// populate with news feeds in the news section
// gets the feeds from server side script 'feed.py'
M.populateFeeds = function(rss_url) {
  $('#feeds-loader').show();
  $('.news-item-wrapper').remove();
  jQuery.getFeed({
    url: 'feeds',
    type: 'GET',
    data: "rss_url="+encodeURIComponent(rss_url),
    success: function(feed) {
      $('#feeds-loader').hide();
      var template = _.template($('#news-item-template').html());
      _.each(feed.items, function(item) {
        x = $('#feeds').append(template({
          title: item.title,
          link: item.link
        }));
      });
    },
    error: function(err) {
      $('#feeds-loader').hide();
      $('#feeds').append('Oops, something went wrong! <br/> Please try again.');
    }
  });
};


/* Other helper functions */

// change all '-' to spaces and capitalize first letter of
// every word
M.humanReadable = function(str) {
  if(typeof str !== "string") {
    str = '';
  }
  return '' + str.replace(/[-]+/g, ' ').replace(/[^\s]+/g, function(str) {
    return str.substr(0,1).toUpperCase() + str.substr(1).toLowerCase();
  });
};

// change all spaces to '-' and everything to lowercase
M.sanitize = function(str) {
  if(typeof str !== "string") {
    str = '';
  }
  return '' + str.replace(/[\s]+/g,'-').replace(/[^\s]+/g, function(str) {
    //TODO: handle special characters!
    return str.replace('&', 'and').toLowerCase();
  });
};

})(M);
