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

//# sourceMappingURL=data:application/json;base64,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QUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLE9BQWhCLEVBQXlCLFNBQUEsR0FBQTttQkFBRyxJQUFJLENBQUMsSUFBTCxDQUFBLEVBQUg7VUFBQSxDQUF6QixFQURNO1FBQUEsQ0FkUjtPQTVGSTtLQVBOO0dBRFMsQ0FBWCxDQUFBOztBQUFBLEVBc0hBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsWUFBZixFQUE2QixTQUFBLEdBQUE7QUFDM0IsSUFBQSxJQUFJLENBQUMsSUFBTCxDQUFBLENBQUEsQ0FBQTtXQUNBLElBQUksQ0FBQyxLQUFMLENBQUEsRUFGMkI7RUFBQSxDQUE3QixDQXRIQSxDQUFBO0FBQUEiLCJmaWxlIjoiZWRpdFRvdXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJ0b3VyID0gbmV3IFRvdXJcbiAgdGVtcGxhdGU6XCJcIlwiXG4gICAgPGRpdiBjbGFzcz0ncG9wb3ZlciB0b3VyJz5cbiAgICAgIDxkaXYgY2xhc3M9J2Fycm93Jz48L2Rpdj5cbiAgICAgIDxoMyBjbGFzcz0ncG9wb3Zlci10aXRsZSc+PC9oMz5cbiAgICAgIDxkaXYgY2xhc3M9J3BvcG92ZXItY29udGVudCc+PC9kaXY+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIHN0ZXBzOltcbiAgICB0aXRsZTogXCJXZWxjb21lXCJcbiAgICBjb250ZW50OiBcIklmIHlvdSBhcmUgdXNpbmcgdGhpcyB0b29sIGZvciB0aGUgZmlyc3QgdGltZSwgd2UgcmVtZW1tYW5kIHRoYXQgeW91IGZvbGxvdyB1cyB0aHJvdWdoIGEgc2ltcGxlIHR1dG9yaWFsIHRoYXQgZ3VpZGUgeW91IHRvIGFkZCB5b3VyIGZpcnN0IGNvdXJzZS5cIlxuICAgIHRlbXBsYXRlOlwiXCJcIlxuICAgIDxkaXYgY2xhc3M9J3BvcG92ZXIgdG91cic+XG4gICAgICA8ZGl2IGNsYXNzPSdhcnJvdyc+PC9kaXY+XG4gICAgICA8aDMgY2xhc3M9J3BvcG92ZXItdGl0bGUnPjwvaDM+XG4gICAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyLWNvbnRlbnQnPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0ncG9wb3Zlci1idG5zJz5cbiAgICAgICAgPGRpdiBjbGFzcz0nYnRuLWdyb3VwIGJ0bi1ncm91cC1qdXN0aWZpZWQnPlxuICAgICAgICAgIDxhIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQnIGRhdGEtcm9sZT0nbmV4dCc+U3RhcnQ8L2E+XG4gICAgICAgICAgPGEgY2xhc3M9J2J0biBidG4tZGVmYXVsdCcgZGF0YS1yb2xlPSdlbmQnPkNhbmNlbDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICBvcnBoYW46IHllc1xuICAgIGJhY2tkcm9wOiB5ZXNcbiAgLFxuICAgIGNvbnRlbnQ6IFwibGV0J3Mgc3RhcnQgYnkgYWRkaW5nIGEgdGVybSBieSBjbGlja2luZyB0aGlzIGJ1dHRvblwiXG4gICAgZWxlbWVudDogXCIuYWRkVGVybUJ0blwiXG4gICAgcGxhY2VtZW50OiBcImJvdHRvbVwiXG4gICAgb25TaG93OiAtPiAjIHRoaXMgZnVuY3Rpb24gd2lsbCB0cmlnZ2VyIHR3byB0aW1lOiBidWcgd2l0aCBib290c3RyYXAtdG91clxuICAgICAgJChcIi5hZGRUZXJtQnRuXCIpLm9uZSBcImNsaWNrXCIsIC0+IFxuICAgICAgICAkKFwiLmFkZFRlcm1CdG5cIikub2ZmIFwiY2xpY2tcIlxuICAgICAgICB0b3VyLm5leHQoKVxuICAsIzJcbiAgICBjb250ZW50OiBcIlNlYXJjaCBmb3IgYSBjb3Vyc2UgeW91IHdvdWxkIGxpa2UgdG8gdGFrZVwiXG4gICAgZWxlbWVudDogXCIjc2VhcmNoSW5wdXRcIlxuICAgIHBsYWNlbWVudDogXCJib3R0b21cIlxuICAgIGNvbnRhaW5lcjogXCIubmF2YmFyLm5hdmJhci1kZWZhdWx0Lm5hdmJhci1maXhlZC10b3BcIlxuICAgIG9uU2hvdzogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9uIFwicmVzdWx0LnVwZGF0ZWQudXdjc1wiLCAoZSwgc3RhdGUpLT5cbiAgICAgICAgaWYgc3RhdGUuc2VhcmNoZWQgYW5kIHN0YXRlLmZvY3VzXG4gICAgICAgICAgJChkb2N1bWVudCkub2ZmIFwicmVzdWx0LnVwZGF0ZWQudXdjc1wiXG4gICAgICAgICAgdG91ci5nb1RvIDRcbiAgICAgICAgZWxzZSBpZiBzdGF0ZS5pbnB1dCBpc250IFwiXCJcbiAgICAgICAgICAkKGRvY3VtZW50KS5vZmYgXCJyZXN1bHQudXBkYXRlZC51d2NzXCJcbiAgICAgICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgICB0b3VyLm5leHQoKVxuICAgICAgICAgICwgMjAwXG4gICwjM1xuICAgIGNvbnRlbnQ6IFwiU2VsZWN0IGEgc3ViamVjdCAvIGNvdXJzZVwiXG4gICAgZWxlbWVudDogXCIuc2VhcmNoUmVzdWx0XCJcbiAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCJcbiAgICBjb250YWluZXI6IFwiLm5hdmJhci5uYXZiYXItZGVmYXVsdC5uYXZiYXItZml4ZWQtdG9wXCJcbiAgICBhbmltYXRpb246IG5vXG4gICAgb25TaG93OiAtPlxuICAgICAgJChkb2N1bWVudCkub24gXCJyZXN1bHQudXBkYXRlZC51d2NzXCIsIChlLCBzdGF0ZSktPlxuICAgICAgICBpZiBzdGF0ZS5pbnB1dCBpcyBcIlwiIG9yIChub3Qgc3RhdGUuZm9jdXMpXG4gICAgICAgICAgdG91ci5nb1RvIDJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRvdXIuZ29UbyAzXG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJyZXN1bHQuc2VhcmNoZWQudXdjc1wiLCAtPlxuICAgICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgdG91ci5uZXh0KClcbiAgICAgICAgLCAyMDBcbiAgICBvbkhpZGU6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vZmYgXCJyZXN1bHQudXBkYXRlZC51d2NzXCJcbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcInJlc3VsdC5zZWFyY2hlZC51d2NzXCJcbiAgLCM0XG4gICAgY29udGVudDogXCJDbGljayBoZXJlIHRvIGFkZCB0aGlzIGNvdXJzZSB0byB0aGUgc2hvcnQtbGlzdFwiXG4gICAgZWxlbWVudDogXCIuYWRkVG9MaXN0QnRuXCJcbiAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCJcbiAgICBjb250YWluZXI6IFwiLm5hdmJhci5uYXZiYXItZGVmYXVsdC5uYXZiYXItZml4ZWQtdG9wXCJcbiAgICBvblNob3c6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJyZXN1bHQudXBkYXRlZC51d2NzXCIsIChlLCBzdGF0ZSktPlxuICAgICAgICBpZiBzdGF0ZS5pbnB1dCBpcyBcIlwiIG9yIChub3Qgc3RhdGUuZm9jdXMpXG4gICAgICAgICAgdG91ci5nb1RvIDJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRvdXIuZ29UbyAzXG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJjb3Vyc2UuYWRkZWQudXdjc1wiLCAtPiB0b3VyLm5leHQoKVxuICAgIG9uSGlkZTogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcInJlc3VsdC51cGRhdGVkLnV3Y3NcIlxuICAgICAgJChkb2N1bWVudCkub2ZmIFwiY291cnNlLmFkZGVkLnV3Y3NcIlxuICAsXG4gICAgY29udGVudDogXCJDb3Vyc2UgaXMgYWRkZWQgdG8gdGhpcyBzaG9ydGxpc3QuIERyYWcgaXQgb3V0IVwiXG4gICAgZWxlbWVudDogXCIuYnVja2V0XCJcbiAgICBwbGFjZW1lbnQ6IFwicmlnaHRcIlxuICAgIG9uU2hvdzogLT5cbiAgICAgICQoZG9jdW1lbnQpLm9uZSBcImNvdXJzZS5tb3ZlLnV3Y3NcIiwgLT4gdG91ci5uZXh0KClcbiAgLFxuICAgIGNvbnRlbnQ6IFwiRHJvcCBpdCBoZXJlXCJcbiAgICBlbGVtZW50OiBcIi50ZXJtIC5jb3Vyc2UubW92ZUJsb2NrXCJcbiAgICBwbGFjZW1lbnQ6IFwiYm90dG9tXCJcbiAgICBvblNob3c6IC0+XG4gICAgICAkKGRvY3VtZW50KS5vbmUgXCJjb3Vyc2UubW92ZWNhbmNlbGVkLnV3Y3NcIiwgLT4gdG91ci5wcmV2KClcbiAgICAgICQoZG9jdW1lbnQpLm9uZSBcImNvdXJzZS5tb3ZlZC51d2NzXCIsIC0+IHRvdXIubmV4dCgpXG4gICAgb25IaWRlOiAtPlxuICAgICAgJChkb2N1bWVudCkub2ZmIFwiY291cnNlLm1vdmVjYW5jZWxlZC51d2NzXCJcbiAgICAgICQoZG9jdW1lbnQpLm9mZiBcImNvdXJzZS5tb3ZlZC51d2NzXCJcbiAgLFxuICAgIHRpdGxlOiBcIlRoYXRzIGl0IVwiXG4gICAgY29udGVudDogXCJZb3UgY2FuIGFsc28gZHJhZyBjb3Vyc2UgYmV0d2VlbiB0ZXJtcy48YnIvPlN3YXAgdGhlIHBvc2l0aW9uIGJ5IGRyYWdpbmcgdGhlIGZpcnN0IGNvdXJzZSBvbiB0b3Agb2YgdGhlIHNlY29uZC48YnIvPjxici8+SGF2ZSBmdW4gcGxhbmluZyB5b3VyIGNvdXJzZXMuPGJyLz5SZW1lbWJlciB0byBnaXZlIHVzIGZlZWRiYWNrLlwiXG4gICAgdGVtcGxhdGU6XCJcIlwiXG4gICAgPGRpdiBjbGFzcz0ncG9wb3ZlciB0b3VyJz5cbiAgICAgIDxkaXYgY2xhc3M9J2Fycm93Jz48L2Rpdj5cbiAgICAgIDxoMyBjbGFzcz0ncG9wb3Zlci10aXRsZSc+PC9oMz5cbiAgICAgIDxkaXYgY2xhc3M9J3BvcG92ZXItY29udGVudCc+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdwb3BvdmVyLWJ0bnMnPlxuICAgICAgICA8YSBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IGJ0bi1ibG9jaycgZGF0YS1yb2xlPSdlbmQnPk9LPC9hPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgb3JwaGFuOiB5ZXNcbiAgICBiYWNrZHJvcDogeWVzXG4gICAgb25TaG93OiAtPlxuICAgICAgJChkb2N1bWVudCkub25lIFwiY2xpY2tcIiwgLT4gdG91ci5uZXh0KClcbiAgXVxuXG4kKGRvY3VtZW50KS5vbiBcInJlYWR5LnV3Y3NcIiwgLT5cbiAgdG91ci5pbml0KClcbiAgdG91ci5zdGFydCgpXG5cbiAgXG4iXX0=