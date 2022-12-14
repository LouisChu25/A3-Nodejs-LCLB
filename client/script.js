const url = window.location.origin;
let socket = io.connect(url);

var myTurn = true,
  symbol;

function getBoardState() {
  var obj = {};
  $(".board button").each(function() {
    obj[$(this).attr("id")] = $(this).text() || "";
  });

  return obj;
}

function isGameOver() {
  var state = getBoardState(),
    matches = ["XXX", "OOO"],
    rows = [
      state.a0 + state.a1 + state.a2,
      state.b0 + state.b1 + state.b2,
      state.c0 + state.c1 + state.c2,
      state.a0 + state.b1 + state.c2,
      state.a2 + state.b1 + state.c0,
      state.a0 + state.b0 + state.c0,
      state.a1 + state.b1 + state.c1,
      state.a2 + state.b2 + state.c2
    ];


  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      return true;
    }
  }
}

function renderTurnMessage() {
  if (!myTurn) {
    $("#messages").text("Your opponent's turn");
    $(".board button").attr("disabled", true);


  } else {
    $("#messages").text("Your turn.");
    $(".board button").removeAttr("disabled");
  }
}

function isTied() {
  let state = getBoardState();

  let isFull = true;
  for (let cell in state) {
    if (state[cell] == "") {
        isFull = false;
    }  
  }
  return isFull;
}

function makeMove(e) {
  e.preventDefault();


  if (!myTurn) {
    return;
  }

  if ($(this).text().length) {
    return;
  }


  socket.emit("make.move", {
    symbol: symbol,
    position: $(this).attr("id")
  });
}

socket.on("move.made", function(data) {

  $("#" + data.position).text(data.symbol);

  myTurn = data.symbol !== symbol;

  if (isTied()) {
    $("#messages").text("Game over. Egalite.");
    $(".board button").attr("disabled", true);

  } else if (isGameOver()) {
    if (myTurn) {
      $("#messages").text("Game over. You lost.");

    } else {
      $("#messages").text("Game over. You won!");
    }

    $(".board button").attr("disabled", true);
  } else {
    renderTurnMessage();
  }
});

socket.on("game.begin", function(data) {
  symbol = data.symbol;

  myTurn = symbol === "X";
  renderTurnMessage();
});


socket.on("opponent.left", function() {
  $("#messages").text("Your opponent left the game.");
  $(".board button").attr("disabled", true);
});

$(function() {
  $(".board button").attr("disabled", true);
  $(".board> button").on("click", makeMove);
});