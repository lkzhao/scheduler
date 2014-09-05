(function() {
  var tour;

  tour = new Tour({
    storage: false,
    template: "<div class='popover tour'>\n  <div class='arrow'></div>\n  <h3 class='popover-title'></h3>\n  <div class='popover-content'></div>\n</div>",
    steps: [
      {
        title: "Welcome",
        content: "If you are using this tool for the first time, we rememmand that you follow us through a simple tutorial that guide you to add your first course.",
        template: "<div class='popover tour'>\n  <div class='arrow'></div>\n  <h3 class='popover-title'></h3>\n  <div class='popover-content'></div>\n  <div class='popover-btns'>\n    <div class='btn-group btn-group-justified'>\n      <a class='btn btn-default' data-role='next'>Start</a>\n      <a class='btn btn-default' data-role='end'>Cancel</a>\n    </div>\n  </div>\n</div>",
        orphan: true,
        backdrop: true
      }, {
        content: "let's start by adding a term by clicking this button",
        element: ".addTermBtn",
        placement: "bottom",
        onShow: function() {
          return $(".addTermBtn").one("click", function() {
            $(".addTermBtn").off("click");
            return tour.next();
          });
        }
      }, {
        content: "Search for a course you would like to take",
        element: "#searchInput",
        placement: "bottom",
        container: ".navbar.navbar-default.navbar-fixed-top",
        onShow: function() {
          return $(document).on("result.updated.uwcs", function(e, state) {
            if (state.searched && state.focus) {
              $(document).off("result.updated.uwcs");
              return tour.goTo(4);
            } else if (state.input !== "") {
              $(document).off("result.updated.uwcs");
              return setTimeout(function() {
                return tour.next();
              }, 200);
            }
          });
        }
      }, {
        content: "Select a subject / course",
        element: ".searchResult",
        placement: "bottom",
        container: ".navbar.navbar-default.navbar-fixed-top",
        animation: false,
        onShow: function() {
          $(document).on("result.updated.uwcs", function(e, state) {
            if (state.input === "" || (!state.focus)) {
              return tour.goTo(2);
            } else {
              return tour.goTo(3);
            }
          });
          return $(document).one("result.searched.uwcs", function() {
            return setTimeout(function() {
              return tour.next();
            }, 200);
          });
        },
        onHide: function() {
          $(document).off("result.updated.uwcs");
          return $(document).off("result.searched.uwcs");
        }
      }, {
        content: "Click here to add this course to the short-list",
        element: ".addToListBtn",
        placement: "bottom",
        container: ".navbar.navbar-default.navbar-fixed-top",
        onShow: function() {
          $(document).one("result.updated.uwcs", function(e, state) {
            if (state.input === "" || (!state.focus)) {
              return tour.goTo(2);
            } else {
              return tour.goTo(3);
            }
          });
          return $(document).one("course.added.uwcs", function() {
            return tour.next();
          });
        },
        onHide: function() {
          $(document).off("result.updated.uwcs");
          return $(document).off("course.added.uwcs");
        }
      }, {
        content: "Course is added to this shortlist. Drag it out!",
        element: ".bucket",
        placement: "right",
        onShow: function() {
          return $(document).one("course.move.uwcs", function() {
            return tour.next();
          });
        }
      }, {
        content: "Drop it here",
        element: ".term .course.moveBlock",
        placement: "bottom",
        onShow: function() {
          $(document).one("course.movecanceled.uwcs", function() {
            return tour.prev();
          });
          return $(document).one("course.moved.uwcs", function() {
            return tour.next();
          });
        },
        onHide: function() {
          $(document).off("course.movecanceled.uwcs");
          return $(document).off("course.moved.uwcs");
        }
      }, {
        title: "Thats it!",
        content: "You can also drag course between terms.<br/>Swap the position by draging the first course on top of the second.<br/><br/>Have fun planing your courses.<br/>Remember to give us feedback.",
        template: "<div class='popover tour'>\n  <div class='arrow'></div>\n  <h3 class='popover-title'></h3>\n  <div class='popover-content'></div>\n  <div class='popover-btns'>\n    <a class='btn btn-default btn-block' data-role='end'>OK</a>\n  </div>\n</div>",
        orphan: true,
        backdrop: true,
        onShow: function() {
          return $(document).one("click", function() {
            return tour.next();
          });
        }
      }
    ]
  });

  $(document).on("ready.uwcs", function() {
    tour.init();
    return tour.start();
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QSxFQUFRLFNBQUEsR0FBQTtpQkFDTixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixTQUFBLEdBQUE7bUJBQUcsSUFBSSxDQUFDLElBQUwsQ0FBQSxFQUFIO1VBQUEsQ0FBekIsRUFETTtRQUFBLENBZFI7T0E1Rkk7S0FSTjtHQURTLENBQVgsQ0FBQTs7QUFBQSxFQXVIQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFlBQWYsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLElBQUEsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFJLENBQUMsS0FBTCxDQUFBLEVBRjJCO0VBQUEsQ0FBN0IsQ0F2SEEsQ0FBQTtBQUFBIiwiZmlsZSI6ImVkaXRUb3VyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsidG91ciA9IG5ldyBUb3VyXG4gIHN0b3JhZ2U6IG5vXG4gIHRlbXBsYXRlOlwiXCJcIlxuICAgIDxkaXYgY2xhc3M9J3BvcG92ZXIgdG91cic+XG4gICAgICA8ZGl2IGNsYXNzPSdhcnJvdyc+PC9kaXY+XG4gICAgICA8aDMgY2xhc3M9J3BvcG92ZXItdGl0bGUnPjwvaDM+XG4gICAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyLWNvbnRlbnQnPjwvZGl2PlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBzdGVwczpbXG4gICAgdGl0bGU6IFwiV2VsY29tZVwiXG4gICAgY29udGVudDogXCJJZiB5b3UgYXJlIHVzaW5nIHRoaXMgdG9vbCBmb3IgdGhlIGZpcnN0IHRpbWUsIHdlIHJlbWVtbWFuZCB0aGF0IHlvdSBmb2xsb3cgdXMgdGhyb3VnaCBhIHNpbXBsZSB0dXRvcmlhbCB0aGF0IGd1aWRlIHlvdSB0byBhZGQgeW91ciBmaXJzdCBjb3Vyc2UuXCJcbiAgICB0ZW1wbGF0ZTpcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyIHRvdXInPlxuICAgICAgPGRpdiBjbGFzcz0nYXJyb3cnPjwvZGl2PlxuICAgICAgPGgzIGNsYXNzPSdwb3BvdmVyLXRpdGxlJz48L2gzPlxuICAgICAgPGRpdiBjbGFzcz0ncG9wb3Zlci1jb250ZW50Jz48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J3BvcG92ZXItYnRucyc+XG4gICAgICAgIDxkaXYgY2xhc3M9J2J0bi1ncm91cCBidG4tZ3JvdXAtanVzdGlmaWVkJz5cbiAgICAgICAgICA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0JyBkYXRhLXJvbGU9J25leHQnPlN0YXJ0PC9hPlxuICAgICAgICAgIDxhIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQnIGRhdGEtcm9sZT0nZW5kJz5DYW5jZWw8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgb3JwaGFuOiB5ZXNcbiAgICBiYWNrZHJvcDogeWVzXG4gICxcbiAgICBjb250ZW50OiBcImxldCdzIHN0YXJ0IGJ5IGFkZGluZyBhIHRlcm0gYnkgY2xpY2tpbmcgdGhpcyBidXR0b25cIlxuICAgIGVsZW1lbnQ6IFwiLmFkZFRlcm1CdG5cIlxuICAgIHBsYWNlbWVudDogXCJib3R0b21cIlxuICAgIG9uU2hvdzogLT4gIyB0aGlzIGZ1bmN0aW9uIHdpbGwgdHJpZ2dlciB0d28gdGltZTogYnVnIHdpdGggYm9vdHN0cmFwLXRvdXJcbiAgICAgICQoXCIuYWRkVGVybUJ0blwiKS5vbmUgXCJjbGlja1wiLCAtPiBcbiAgICAgICAgJChcIi5hZGRUZXJtQnRuXCIpLm9mZiBcImNsaWNrXCJcbiAgICAgICAgdG91ci5uZXh0KClcbiAgLCMyXG4gICAgY29udGVudDogXCJTZWFyY2ggZm9yIGEgY291cnNlIHlvdSB3b3VsZCBsaWtlIHRvIHRha2VcIlxuICAgIGVsZW1lbnQ6IFwiI3NlYXJjaElucHV0XCJcbiAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCJcbiAgICBjb250YWluZXI6IFwiLm5hdmJhci5uYXZiYXItZGVmYXVsdC5uYXZiYXItZml4ZWQtdG9wXCJcbiAgICBvblNob3c6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbiBcInJlc3VsdC51cGRhdGVkLnV3Y3NcIiwgKGUsIHN0YXRlKS0+XG4gICAgICAgIGlmIHN0YXRlLnNlYXJjaGVkIGFuZCBzdGF0ZS5mb2N1c1xuICAgICAgICAgICQoZG9jdW1lbnQpLm9mZiBcInJlc3VsdC51cGRhdGVkLnV3Y3NcIlxuICAgICAgICAgIHRvdXIuZ29UbyA0XG4gICAgICAgIGVsc2UgaWYgc3RhdGUuaW5wdXQgaXNudCBcIlwiXG4gICAgICAgICAgJChkb2N1bWVudCkub2ZmIFwicmVzdWx0LnVwZGF0ZWQudXdjc1wiXG4gICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgdG91ci5uZXh0KClcbiAgICAgICAgICAsIDIwMFxuICAsIzNcbiAgICBjb250ZW50OiBcIlNlbGVjdCBhIHN1YmplY3QgLyBjb3Vyc2VcIlxuICAgIGVsZW1lbnQ6IFwiLnNlYXJjaFJlc3VsdFwiXG4gICAgcGxhY2VtZW50OiBcImJvdHRvbVwiXG4gICAgY29udGFpbmVyOiBcIi5uYXZiYXIubmF2YmFyLWRlZmF1bHQubmF2YmFyLWZpeGVkLXRvcFwiXG4gICAgYW5pbWF0aW9uOiBub1xuICAgIG9uU2hvdzogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9uIFwicmVzdWx0LnVwZGF0ZWQudXdjc1wiLCAoZSwgc3RhdGUpLT5cbiAgICAgICAgaWYgc3RhdGUuaW5wdXQgaXMgXCJcIiBvciAobm90IHN0YXRlLmZvY3VzKVxuICAgICAgICAgIHRvdXIuZ29UbyAyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0b3VyLmdvVG8gM1xuICAgICAgJChkb2N1bWVudCkub25lIFwicmVzdWx0LnNlYXJjaGVkLnV3Y3NcIiwgLT5cbiAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgIHRvdXIubmV4dCgpXG4gICAgICAgICwgMjAwXG4gICAgb25IaWRlOiAtPlxuICAgICAgJChkb2N1bWVudCkub2ZmIFwicmVzdWx0LnVwZGF0ZWQudXdjc1wiXG4gICAgICAkKGRvY3VtZW50KS5vZmYgXCJyZXN1bHQuc2VhcmNoZWQudXdjc1wiXG4gICwjNFxuICAgIGNvbnRlbnQ6IFwiQ2xpY2sgaGVyZSB0byBhZGQgdGhpcyBjb3Vyc2UgdG8gdGhlIHNob3J0LWxpc3RcIlxuICAgIGVsZW1lbnQ6IFwiLmFkZFRvTGlzdEJ0blwiXG4gICAgcGxhY2VtZW50OiBcImJvdHRvbVwiXG4gICAgY29udGFpbmVyOiBcIi5uYXZiYXIubmF2YmFyLWRlZmF1bHQubmF2YmFyLWZpeGVkLXRvcFwiXG4gICAgb25TaG93OiAtPlxuICAgICAgJChkb2N1bWVudCkub25lIFwicmVzdWx0LnVwZGF0ZWQudXdjc1wiLCAoZSwgc3RhdGUpLT5cbiAgICAgICAgaWYgc3RhdGUuaW5wdXQgaXMgXCJcIiBvciAobm90IHN0YXRlLmZvY3VzKVxuICAgICAgICAgIHRvdXIuZ29UbyAyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0b3VyLmdvVG8gM1xuICAgICAgJChkb2N1bWVudCkub25lIFwiY291cnNlLmFkZGVkLnV3Y3NcIiwgLT4gdG91ci5uZXh0KClcbiAgICBvbkhpZGU6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vZmYgXCJyZXN1bHQudXBkYXRlZC51d2NzXCJcbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcImNvdXJzZS5hZGRlZC51d2NzXCJcbiAgLFxuICAgIGNvbnRlbnQ6IFwiQ291cnNlIGlzIGFkZGVkIHRvIHRoaXMgc2hvcnRsaXN0LiBEcmFnIGl0IG91dCFcIlxuICAgIGVsZW1lbnQ6IFwiLmJ1Y2tldFwiXG4gICAgcGxhY2VtZW50OiBcInJpZ2h0XCJcbiAgICBvblNob3c6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJjb3Vyc2UubW92ZS51d2NzXCIsIC0+IHRvdXIubmV4dCgpXG4gICxcbiAgICBjb250ZW50OiBcIkRyb3AgaXQgaGVyZVwiXG4gICAgZWxlbWVudDogXCIudGVybSAuY291cnNlLm1vdmVCbG9ja1wiXG4gICAgcGxhY2VtZW50OiBcImJvdHRvbVwiXG4gICAgb25TaG93OiAtPlxuICAgICAgJChkb2N1bWVudCkub25lIFwiY291cnNlLm1vdmVjYW5jZWxlZC51d2NzXCIsIC0+IHRvdXIucHJldigpXG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJjb3Vyc2UubW92ZWQudXdjc1wiLCAtPiB0b3VyLm5leHQoKVxuICAgIG9uSGlkZTogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcImNvdXJzZS5tb3ZlY2FuY2VsZWQudXdjc1wiXG4gICAgICAkKGRvY3VtZW50KS5vZmYgXCJjb3Vyc2UubW92ZWQudXdjc1wiXG4gICxcbiAgICB0aXRsZTogXCJUaGF0cyBpdCFcIlxuICAgIGNvbnRlbnQ6IFwiWW91IGNhbiBhbHNvIGRyYWcgY291cnNlIGJldHdlZW4gdGVybXMuPGJyLz5Td2FwIHRoZSBwb3NpdGlvbiBieSBkcmFnaW5nIHRoZSBmaXJzdCBjb3Vyc2Ugb24gdG9wIG9mIHRoZSBzZWNvbmQuPGJyLz48YnIvPkhhdmUgZnVuIHBsYW5pbmcgeW91ciBjb3Vyc2VzLjxici8+UmVtZW1iZXIgdG8gZ2l2ZSB1cyBmZWVkYmFjay5cIlxuICAgIHRlbXBsYXRlOlwiXCJcIlxuICAgIDxkaXYgY2xhc3M9J3BvcG92ZXIgdG91cic+XG4gICAgICA8ZGl2IGNsYXNzPSdhcnJvdyc+PC9kaXY+XG4gICAgICA8aDMgY2xhc3M9J3BvcG92ZXItdGl0bGUnPjwvaDM+XG4gICAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyLWNvbnRlbnQnPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0ncG9wb3Zlci1idG5zJz5cbiAgICAgICAgPGEgY2xhc3M9J2J0biBidG4tZGVmYXVsdCBidG4tYmxvY2snIGRhdGEtcm9sZT0nZW5kJz5PSzwvYT5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICAgIG9ycGhhbjogeWVzXG4gICAgYmFja2Ryb3A6IHllc1xuICAgIG9uU2hvdzogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9uZSBcImNsaWNrXCIsIC0+IHRvdXIubmV4dCgpXG4gIF1cblxuJChkb2N1bWVudCkub24gXCJyZWFkeS51d2NzXCIsIC0+XG4gIHRvdXIuaW5pdCgpXG4gIHRvdXIuc3RhcnQoKVxuXG4gIFxuIl19