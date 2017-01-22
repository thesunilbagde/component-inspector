var rempl = require('rempl');
var DataObject = require('basis.data').Object;
var Node = require('basis.ui').Node;
var sections = require('./sections.js');
var DomTree = require('./dom-tree.js');
var selectedDomNode = new basis.Token(true);
var noData = new DataObject();
var remoteApi;

function findParentComponent(node) {
  node = node && node.parentNode;

  while (node) {
    if (api.isComponentRootNode(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
}

var defaultSection = {
  name: 'Component',
  childNodes: [
    // {
    //   type: 'instance',
    //   loc: selectedInstance.as(api.getInstanceLocation)
    // },
    // {
    //   type: 'class',
    //   loc: selectedInstance.as(function getRefClassLoc(instance) {
    //     var cls = api.getInstanceClass(instance);
    //     return api.getLocation(cls);
    //   })
    // },
    // {
    //   type: 'render',
    //   loc: selectedInstance.as(api.getInstanceRenderLocation)
    // }
  ]
};

var info = new Node({
  childClass: sections.Section
});

var sectionFactory = {
  html: function(name, html) {
    return new sections.HTMLSection({
      name: name || '',
      html: String(html)
    });
  },
  dom: function(name, element) {
    return new sections.DOMSection({
      name: name || '',
      dom: element
    });
  }
};

// selectedInstance.attach(function(instance) {
//   if (!instance) {
//     info.setChildNodes();
//     return;
//   };

//   var base = api.showDefaultInfo(instance) ? [defaultSection] : [];
//   info.setChildNodes(base.concat(
//     api.getAdditionalInstanceInfo(instance, sectionFactory) || []
//   ));
// });

var view = new Node({
  template: resource('./template/view.tmpl'),
  binding: {
    connected: basis.fn.$const(true), // TODO: nake it works
    hasSubject: {
      events: 'update',
      getter: function(node) {
        return Boolean(node.data.tree);
      }
    },
    sourceTitle: 'data:',
    upName: 'data:',
    domTree: 'satellite:',
    info: 'satellite:'
  },
  action: {
    up: function() {
      remoteApi.invoke('up');
    },
    reset: function() {
      remoteApi.invoke('reset');
    },
    logInfo: function() {
      remoteApi.invoke('logInfo');
    }
  },
  satellite: {
    domTree: DomTree,
    info: info
  }
});

rempl.getSubscriber(function(subscriber) {
  remoteApi = subscriber.ns('dom-tree');
  remoteApi.subscribe(function(data) {
    if (data) {
      view.update(data);
    } else {
      // clear data
      view.setDelegate(noData);
      view.setDelegate();
    }
  });
});

module.exports = view;
