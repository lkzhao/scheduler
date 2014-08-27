(function() {
  var tour;

  tour = new Tour({
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
              return tour.goTo(tour.getCurrentStep() + 2);
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
              return tour.goTo(tour.getCurrentStep() - 1);
            } else {
              return tour.goTo(tour.getCurrentStep());
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
              return tour.goTo(tour.getCurrentStep() - 2);
            } else {
              return tour.goTo(tour.getCurrentStep() - 1);
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

//# sourceMappingURL=data:application/json;base64,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QU8sV0FBUDtBQUFBLFFBQ0EsT0FBQSxFQUFTLDJMQURUO0FBQUEsUUFFQSxRQUFBLEVBQVMsb1BBRlQ7QUFBQSxRQVlBLE1BQUEsRUFBUSxJQVpSO0FBQUEsUUFhQSxRQUFBLEVBQVUsSUFiVjtBQUFBLFFBY0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtpQkFDTixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixPQUFoQixFQUF5QixTQUFBLEdBQUE7bUJBQUcsSUFBSSxDQUFDLElBQUwsQ0FBQSxFQUFIO1VBQUEsQ0FBekIsRUFETTtRQUFBLENBZFI7T0E1Rkk7S0FQTjtHQURTLENBQVgsQ0FBQTs7QUFBQSxFQXNIQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFlBQWYsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLElBQUEsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFJLENBQUMsS0FBTCxDQUFBLEVBRjJCO0VBQUEsQ0FBN0IsQ0F0SEEsQ0FBQTtBQUFBIiwiZmlsZSI6ImVkaXRUb3VyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsidG91ciA9IG5ldyBUb3VyXG4gIHRlbXBsYXRlOlwiXCJcIlxuICAgIDxkaXYgY2xhc3M9J3BvcG92ZXIgdG91cic+XG4gICAgICA8ZGl2IGNsYXNzPSdhcnJvdyc+PC9kaXY+XG4gICAgICA8aDMgY2xhc3M9J3BvcG92ZXItdGl0bGUnPjwvaDM+XG4gICAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyLWNvbnRlbnQnPjwvZGl2PlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBzdGVwczpbXG4gICAgdGl0bGU6IFwiV2VsY29tZVwiXG4gICAgY29udGVudDogXCJJZiB5b3UgYXJlIHVzaW5nIHRoaXMgdG9vbCBmb3IgdGhlIGZpcnN0IHRpbWUsIHdlIHJlbWVtbWFuZCB0aGF0IHlvdSBmb2xsb3cgdXMgdGhyb3VnaCBhIHNpbXBsZSB0dXRvcmlhbCB0aGF0IGd1aWRlIHlvdSB0byBhZGQgeW91ciBmaXJzdCBjb3Vyc2UuXCJcbiAgICB0ZW1wbGF0ZTpcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyIHRvdXInPlxuICAgICAgPGRpdiBjbGFzcz0nYXJyb3cnPjwvZGl2PlxuICAgICAgPGgzIGNsYXNzPSdwb3BvdmVyLXRpdGxlJz48L2gzPlxuICAgICAgPGRpdiBjbGFzcz0ncG9wb3Zlci1jb250ZW50Jz48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J3BvcG92ZXItYnRucyc+XG4gICAgICAgIDxkaXYgY2xhc3M9J2J0bi1ncm91cCBidG4tZ3JvdXAtanVzdGlmaWVkJz5cbiAgICAgICAgICA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0JyBkYXRhLXJvbGU9J25leHQnPlN0YXJ0PC9hPlxuICAgICAgICAgIDxhIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQnIGRhdGEtcm9sZT0nZW5kJz5DYW5jZWw8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgb3JwaGFuOiB5ZXNcbiAgICBiYWNrZHJvcDogeWVzXG4gICxcbiAgICBjb250ZW50OiBcImxldCdzIHN0YXJ0IGJ5IGFkZGluZyBhIHRlcm0gYnkgY2xpY2tpbmcgdGhpcyBidXR0b25cIlxuICAgIGVsZW1lbnQ6IFwiLmFkZFRlcm1CdG5cIlxuICAgIHBsYWNlbWVudDogXCJib3R0b21cIlxuICAgIG9uU2hvdzogLT4gIyB0aGlzIGZ1bmN0aW9uIHdpbGwgdHJpZ2dlciB0d28gdGltZTogYnVnIHdpdGggYm9vdHN0cmFwLXRvdXJcbiAgICAgICQoXCIuYWRkVGVybUJ0blwiKS5vbmUgXCJjbGlja1wiLCAtPiBcbiAgICAgICAgJChcIi5hZGRUZXJtQnRuXCIpLm9mZiBcImNsaWNrXCJcbiAgICAgICAgdG91ci5uZXh0KClcbiAgLFxuICAgIGNvbnRlbnQ6IFwiU2VhcmNoIGZvciBhIGNvdXJzZSB5b3Ugd291bGQgbGlrZSB0byB0YWtlXCJcbiAgICBlbGVtZW50OiBcIiNzZWFyY2hJbnB1dFwiXG4gICAgcGxhY2VtZW50OiBcImJvdHRvbVwiXG4gICAgY29udGFpbmVyOiBcIi5uYXZiYXIubmF2YmFyLWRlZmF1bHQubmF2YmFyLWZpeGVkLXRvcFwiXG4gICAgb25TaG93OiAtPlxuICAgICAgJChkb2N1bWVudCkub24gXCJyZXN1bHQudXBkYXRlZC51d2NzXCIsIChlLCBzdGF0ZSktPlxuICAgICAgICBpZiBzdGF0ZS5zZWFyY2hlZCBhbmQgc3RhdGUuZm9jdXNcbiAgICAgICAgICAkKGRvY3VtZW50KS5vZmYgXCJyZXN1bHQudXBkYXRlZC51d2NzXCJcbiAgICAgICAgICB0b3VyLmdvVG8gdG91ci5nZXRDdXJyZW50U3RlcCgpICsgMlxuICAgICAgICBlbHNlIGlmIHN0YXRlLmlucHV0IGlzbnQgXCJcIlxuICAgICAgICAgICQoZG9jdW1lbnQpLm9mZiBcInJlc3VsdC51cGRhdGVkLnV3Y3NcIlxuICAgICAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgICAgIHRvdXIubmV4dCgpXG4gICAgICAgICAgLCAyMDBcbiAgLFxuICAgIGNvbnRlbnQ6IFwiU2VsZWN0IGEgc3ViamVjdCAvIGNvdXJzZVwiXG4gICAgZWxlbWVudDogXCIuc2VhcmNoUmVzdWx0XCJcbiAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCJcbiAgICBjb250YWluZXI6IFwiLm5hdmJhci5uYXZiYXItZGVmYXVsdC5uYXZiYXItZml4ZWQtdG9wXCJcbiAgICBhbmltYXRpb246IG5vXG4gICAgb25TaG93OiAtPlxuICAgICAgJChkb2N1bWVudCkub24gXCJyZXN1bHQudXBkYXRlZC51d2NzXCIsIChlLCBzdGF0ZSktPlxuICAgICAgICBpZiBzdGF0ZS5pbnB1dCBpcyBcIlwiIG9yIChub3Qgc3RhdGUuZm9jdXMpXG4gICAgICAgICAgdG91ci5nb1RvIHRvdXIuZ2V0Q3VycmVudFN0ZXAoKSAtIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRvdXIuZ29UbyB0b3VyLmdldEN1cnJlbnRTdGVwKClcbiAgICAgICQoZG9jdW1lbnQpLm9uZSBcInJlc3VsdC5zZWFyY2hlZC51d2NzXCIsIC0+XG4gICAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgICB0b3VyLm5leHQoKVxuICAgICAgICAsIDIwMFxuICAgIG9uSGlkZTogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcInJlc3VsdC51cGRhdGVkLnV3Y3NcIlxuICAgICAgJChkb2N1bWVudCkub2ZmIFwicmVzdWx0LnNlYXJjaGVkLnV3Y3NcIlxuICAsXG4gICAgY29udGVudDogXCJDbGljayBoZXJlIHRvIGFkZCB0aGlzIGNvdXJzZSB0byB0aGUgc2hvcnQtbGlzdFwiXG4gICAgZWxlbWVudDogXCIuYWRkVG9MaXN0QnRuXCJcbiAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCJcbiAgICBjb250YWluZXI6IFwiLm5hdmJhci5uYXZiYXItZGVmYXVsdC5uYXZiYXItZml4ZWQtdG9wXCJcbiAgICBvblNob3c6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJyZXN1bHQudXBkYXRlZC51d2NzXCIsIChlLCBzdGF0ZSktPlxuICAgICAgICBpZiBzdGF0ZS5pbnB1dCBpcyBcIlwiIG9yIChub3Qgc3RhdGUuZm9jdXMpXG4gICAgICAgICAgdG91ci5nb1RvIHRvdXIuZ2V0Q3VycmVudFN0ZXAoKSAtIDJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRvdXIuZ29UbyB0b3VyLmdldEN1cnJlbnRTdGVwKCkgLSAxXG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJjb3Vyc2UuYWRkZWQudXdjc1wiLCAtPiB0b3VyLm5leHQoKVxuICAgIG9uSGlkZTogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcInJlc3VsdC51cGRhdGVkLnV3Y3NcIlxuICAgICAgJChkb2N1bWVudCkub2ZmIFwiY291cnNlLmFkZGVkLnV3Y3NcIlxuICAsXG4gICAgY29udGVudDogXCJDb3Vyc2UgaXMgYWRkZWQgdG8gdGhpcyBzaG9ydGxpc3QuIERyYWcgaXQgb3V0IVwiXG4gICAgZWxlbWVudDogXCIuYnVja2V0XCJcbiAgICBwbGFjZW1lbnQ6IFwicmlnaHRcIlxuICAgIG9uU2hvdzogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9uZSBcImNvdXJzZS5tb3ZlLnV3Y3NcIiwgLT4gdG91ci5uZXh0KClcbiAgLFxuICAgIGNvbnRlbnQ6IFwiRHJvcCBpdCBoZXJlXCJcbiAgICBlbGVtZW50OiBcIi50ZXJtIC5jb3Vyc2UubW92ZUJsb2NrXCJcbiAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCJcbiAgICBvblNob3c6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJjb3Vyc2UubW92ZWNhbmNlbGVkLnV3Y3NcIiwgLT4gdG91ci5wcmV2KClcbiAgICAgICQoZG9jdW1lbnQpLm9uZSBcImNvdXJzZS5tb3ZlZC51d2NzXCIsIC0+IHRvdXIubmV4dCgpXG4gICAgb25IaWRlOiAtPlxuICAgICAgJChkb2N1bWVudCkub2ZmIFwiY291cnNlLm1vdmVjYW5jZWxlZC51d2NzXCJcbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcImNvdXJzZS5tb3ZlZC51d2NzXCJcbiAgLFxuICAgIHRpdGxlOiBcIlRoYXRzIGl0IVwiXG4gICAgY29udGVudDogXCJZb3UgY2FuIGFsc28gZHJhZyBjb3Vyc2UgYmV0d2VlbiB0ZXJtcy48YnIvPlN3YXAgdGhlIHBvc2l0aW9uIGJ5IGRyYWdpbmcgdGhlIGZpcnN0IGNvdXJzZSBvbiB0b3Agb2YgdGhlIHNlY29uZC48YnIvPjxici8+SGF2ZSBmdW4gcGxhbmluZyB5b3VyIGNvdXJzZXMuPGJyLz5SZW1lbWJlciB0byBnaXZlIHVzIGZlZWRiYWNrLlwiXG4gICAgdGVtcGxhdGU6XCJcIlwiXG4gICAgPGRpdiBjbGFzcz0ncG9wb3ZlciB0b3VyJz5cbiAgICAgIDxkaXYgY2xhc3M9J2Fycm93Jz48L2Rpdj5cbiAgICAgIDxoMyBjbGFzcz0ncG9wb3Zlci10aXRsZSc+PC9oMz5cbiAgICAgIDxkaXYgY2xhc3M9J3BvcG92ZXItY29udGVudCc+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyLWJ0bnMnPlxuICAgICAgICA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IGJ0bi1ibG9jaycgZGF0YS1yb2xlPSdlbmQnPk9LPC9hPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgb3JwaGFuOiB5ZXNcbiAgICBiYWNrZHJvcDogeWVzXG4gICAgb25TaG93OiAtPlxuICAgICAgJChkb2N1bWVudCkub25lIFwiY2xpY2tcIiwgLT4gdG91ci5uZXh0KClcbiAgXVxuXG4kKGRvY3VtZW50KS5vbiBcInJlYWR5LnV3Y3NcIiwgLT5cbiAgdG91ci5pbml0KClcbiAgdG91ci5zdGFydCgpXG5cbiAgXG4iXX0=