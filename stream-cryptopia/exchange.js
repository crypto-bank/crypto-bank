function getTradePairInfo(n) {
  tradePairLoadStart();
  getTradePairDataRequest = postJson(actionTradePairData, {
    tradePairId: n
  }, function(n) {
    selectedTradePair = n.TradePair;
    selectedMarket = selectedTradePair.Symbol + "/" + selectedTradePair.BaseSymbol;
    $(".tradepair-basefee").text(n.TradePair.BaseFee.toFixed(2));
    $(".tradepair-basemintrade").text(n.TradePair.BaseMinTrade.toFixed(8));
    updateSelectedChart();
    updateTitle(n.TradePair, !1);
    updateTicker(n.Ticker);
    updateStatusMessage(n.TradePair);
    updateBuyOrdersTable(n.Buys);
    updateSellOrdersTable(n.Sells);
    updateMarketHistoryTable(n.History);
    tradePairLoadComplete()
  });
  isAuthenticated && (createUserOpenOrdersTable(), createUserOrderHistoryTable(), updateBalance(n, !1), getUserTradePairDataRequest = postJson(actionTradePairUserData, {
    tradePairId: n
  }, function(n) {
    updateUserOpenOrdersTable(n.Open);
    updateUserOrderHistoryTable(n.History)
  }))
}

function clearTarget() {
  clearStatusMessage();
  clearTicker();
  clearCharts();
  clearBalance();
  clearBuySellInputs();
  clearBuyOrdersTable();
  clearSellOrdersTable();
  clearMarketHistoryTable();
  clearUserOpenOrdersTable();
  clearUserOrderHistoryTable()
}

function tradePairLoadStart() {
  $(".currencyData-tradepair").attr("disabled", "disabled");
  getTradePairDataRequest && getTradePairDataRequest.readyState != 4 && getTradePairDataRequest.abort();
  getUserTradePairDataRequest && getUserTradePairDataRequest.readyState != 4 && getUserTradePairDataRequest.abort();
  getTradePairBalanceRequest && getTradePairBalanceRequest.readyState != 4 && getTradePairBalanceRequest.abort();
  getTradePairChartRequest && getTradePairChartRequest.readyState != 4 && getTradePairChartRequest.abort();
  clearTarget();
  $(".dataTables_empty").html('<span><i class="fa fa-spinner fa-pulse"><\/i> Loading...<\/span>')
}

function tradePairLoadComplete() {
  $(".currencyData-tradepair").removeAttr("disabled")
}

function updateTicker(n) {
  $(".ticker-change").text(n.Change.toFixed(2)).addClass(changeHighlight(n.Change));
  $(".ticker-last").text(n.Last.toFixed(8));
  $(".ticker-high").text(n.High.toFixed(8));
  $(".ticker-low").text(n.Low.toFixed(8));
  $(".ticker-volume").text(n.Volume.toFixed(8));
  $(".ticker-basevolume").text(n.BaseVolume.toFixed(8));
  document.title = n.Last.toFixed(8) + " " + selectedTradePair.Symbol + "/" + selectedTradePair.BaseSymbol + " Market - Cryptopia"
}

function clearTicker() {
  $(".ticker-change").removeClass("text-danger text-success").text("0.00");
  $(".ticker-last, .ticker-high, .ticker-low, .ticker-volume, .ticker-basevolume").text("0.00000000")
}

function updateTitle(n, t) {
  t ? $(".exchangeinfo-container ").fadeTo(200, .5, function() {
    $(".tradepair-symbol").text(n.Symbol);
    $(".tradepair-basesymbol").text(n.BaseSymbol);
    $(".exchangeinfo-title").text(n.Name);
    $(".exchangeinfo-title-logo").attr("src", "/Content/Images/Coins/" + n.Symbol + "-medium.png")
  }).fadeTo(200, 1) : ($(".tradepair-symbol").text(n.Symbol), $(".tradepair-basesymbol").text(n.BaseSymbol), $(".exchangeinfo-title").text(n.Name), $(".exchangeinfo-title-logo").attr("src", "/Content/Images/Coins/" + n.Symbol + "-medium.png"))
}

function updateStatusMessage(n) {
  var t = $("#tradepairStatus"),
    i = n.Symbol + "/" + n.BaseSymbol;
  n.Status == 0 ? n.StatusMessage && (t.show(), t.find(".alert").addClass("alert-info"), t.find("h4").text("Market Information"), t.find("p").text(n.StatusMessage)) : n.Status == 1 ? (t.show(), t.find(".alert").addClass("alert-danger"), t.find("h4").text("Market Closing"), t.find("p").text(n.StatusMessage || i + " market is closing, please cancel any open orders and withdraw your coins."), $(".submit-button").hide(), $(".submit-button-alert").html("Market Closing").show()) : n.Status == 2 && (t.show(), t.find(".alert").addClass("alert-warning"), t.find("h4").text("Market Paused"), t.find("p").text(n.StatusMessage || i + " trading is currently paused."), $(".submit-button").hide(), $(".submit-button-alert").html("Market Paused").show())
}

function clearStatusMessage() {
  $(".submit-button").show();
  $(".submit-button-alert").hide();
  $("#tradepairStatus").hide().find(".alert").removeClass("alert-info alert-warning alert-danger")
}

function marketFavoriteFilter(n, t) {
  if (n.sInstance == "market-list" && showFavoriteMarkets) {
    for (var i = 0; i < favoriteMarkets.length; i++)
      if (favoriteMarkets[i] == t[1]) return !0;
    return favoriteMarkets.length == 0
  }
  return !0
}

function setupMarketList(n) {
  var t, r, u;
  if (n) {
    var f = $(".stackmenu-content").height(),
      e = $("#market-list_wrapper  .dataTables_scrollHead").height(),
      o = $("#market-list_wrapper  .dataTables_filter").height(),
      i = f - (e + o);
    $("#market-list_wrapper .dataTables_scrollBody").height(i);
    updateMarketFavorites();
    t = $("#market-list_wrapper .currencyData-tradepair-" + selectedTradePair.TradePairId);
    t && t.position() && (r = i / 6, u = t.position().top + r, u > i && $("#market-list_wrapper .dataTables_scrollBody").scrollTop(t.position().top - r))
  }
}

function updateMarketFavorites() {
  clearTimeout(updateMarketFavoritesTimeout);
  updateMarketFavoritesTimeout = setTimeout(function() {
    if ($("#market-list_wrapper .market-favorite").removeClass("market-favorite-active"), favoriteMarkets)
      for (var n = 0; n < favoriteMarkets.length; n++) $("#market-list_wrapper .market-favorite-" + favoriteMarkets[n]).addClass("market-favorite-active")
  }, 100)
}

function changeBaseMarket(n) {
  $(".currencyData-content").hide();
  $("#currencyData-content-" + n).show();
  $(".currencyData-btn").removeClass("active");
  $(".currencyData-btn-" + n).addClass("active");
  marketSummaryView && (marketSummaryTables[n] || (marketSummaryTables[n] = createSummaryTable(n)), marketSummaryTables[n] && marketSummaryTables[n].clear().draw());
  marketTable.clear().draw();
  $(".dataTables_empty").html('<span><i class="fa fa-spinner fa-pulse"><\/i> Loading...<\/span>');
  getCurrencySummaryRequest && getCurrencySummaryRequest.readyState != 4 && getCurrencySummaryRequest.abort();
  getCurrencySummaryRequest = postJson(actionCurrencySummary, {
    baseMarket: n
  }, function(t) {
    marketTable.rows.add(t.aaData).draw();
    marketSummaryView && marketSummaryTables[n] && marketSummaryTables[n].rows.add(t.aaData).draw();
    marketDataSet = t.aaData;
    setupMarketList(!0);
    marketTable.columns.adjust()
  })
}

function updateMarketItem(n) {
  for (var t, f, e, i, o, r, u = 0; u < marketDataSet.length; u++)
    if (t = marketDataSet[u], t[1] == n.TradePairId) {
      r = t[9] > n.Last.toFixed(8) ? "red" : t[9] < n.Last.toFixed(8) ? "green" : "blue";
      t[4] = n.Change.toFixed(2);
      t[5] = n.BaseVolume.toFixed(8);
      t[6] = n.Volume.toFixed(8);
      t[7] = n.High.toFixed(8);
      t[8] = n.Low.toFixed(8);
      t[9] = n.Last.toFixed(8);
      break
    }
  r && (f = $("#market-list .currencyData-tradepair-" + n.TradePairId), marketTable.row(f).invalidate(), highlightRemove("#market-list .currencyData-tradepair"), highlightItem(f, r), updateMarketFavorites(), marketSummaryView && (e = $("#currencyData-" + currentBaseMarket + " .currencyData-tradepair-" + n.TradePairId), marketSummaryTables[currentBaseMarket].row(e).invalidate(), highlightRemove("#currencyData-" + currentBaseMarket + " .currencyData-tradepair"), highlightItem(e, r), i = "#top-stats .currencyData-tradepair-" + n.TradePairId, o = n.Change > 0 ? "text-success" : n.Change < 0 ? "text-danger" : "", $(i + " > td:nth-child(2)").removeClass("text-*").addClass(o).text(n.Change.toFixed(2) + "%"), $(i + " > td:nth-child(3)").text(n.BaseVolume.toFixed(8)), $(i + " > td:nth-child(4)").text(n.Volume.toFixed(8)), $(i + " > td:nth-child(5)").text(n.High.toFixed(8)), $(i + " > td:nth-child(6)").text(n.Low.toFixed(8))))
}

function createSummaryTable(n) {
  var t = $("#currencyData-" + n);
  return t.find("tbody").empty(), t.DataTable({
    dom: "<'row'<'col-sm-12'tr>>",
    order: [
      [5, "desc"]
    ],
    lengthChange: !1,
    processing: !1,
    bServerSide: !1,
    searching: !1,
    paging: !1,
    scrollCollapse: !1,
    scrollY: "100%",
    autoWidth: !1,
    info: !1,
    language: {
      emptyTable: "Loading markets...",
      sZeroRecords: "No markets found.",
      search: "",
      searchPlaceholder: "Search markets"
    },
    columnDefs: [{
      targets: [0],
      visible: !1
    }, {
      targets: [1],
      visible: !1
    }, {
      targets: [10],
      visible: !1
    }, {
      targets: [2],
      render: function(n, t, i) {
        return '<div style="display:inline-block"><div class="sprite-small small/' + i[3] + '-small.png"><\/div> ' + n + " (" + i[3] + ")<\/div>"
      }
    }, {
      targets: [3],
      render: function(t) {
        return '<a href="/Exchange?market=' + t + "_" + n + '">' + t + "/" + n + "<\/a>"
      }
    }, {
      targets: [4],
      render: function(n) {
        return '<div class="text-right ' + (n > 0 ? "text-success" : n < 0 ? "text-danger" : "") + '">' + n + "%<\/div>"
      }
    }, {
      targets: [5, 6, 7, 8, 9],
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }],
    fnRowCallback: function(n, t) {
      $(n).addClass("currencyData-tradepair-" + t[1])
    }
  })
}

function toggleSideMenu() {
  isSideMenuOpen ? ($("#main-wrapper").css({
    "min-width": "325px"
  }), $("#sidebar-wrapper").animate({
    width: "0px",
    opacity: "0"
  }, 400), $("#main-wrapper").animate({
    marginLeft: "35px"
  }, 400, function() {
    triggerWindowResize()
  })) : ($("#main-wrapper").css({
    "min-width": "725px"
  }), $("#sidebar-wrapper").animate({
    width: "365px",
    opacity: "1"
  }, 400), $("#main-wrapper").animate({
    marginLeft: "400px"
  }, 400, function() {
    triggerWindowResize()
  }));
  isSideMenuOpen = !isSideMenuOpen
}

function setupBalances() {
  if (sideMenuBalanceTable) sideMenuBalanceTable.columns.adjust();
  else {
    sideMenuBalanceTable = $("#userBalances").DataTable({
      dom: "<'row'<'col-sm-12'tr>>",
      order: [
        [balanceTableSortColumn, balanceTableSortDirection]
      ],
      lengthChange: !1,
      processing: !1,
      bServerSide: !1,
      searching: !0,
      paging: !1,
      sort: !0,
      info: !1,
      scrollX: "100%",
      sAjaxSource: actionTradeBalances,
      sServerMethod: "POST",
      language: {
        emptyTable: "No balances found.",
        sZeroRecords: "No balances found."
      },
      columnDefs: [{
        targets: [5, 6, 7, 8],
        visible: !1
      }, {
        targets: [0],
        visible: !0,
        sortable: !1,
        render: function(n, t, i) {
          var r = i[8] ? " balance-favorite-active" : "";
          return '<div class="balance-favorite balance-favorite-' + n + r + '" data-balanceid="' + n + '"><i class="fa fa-ellipsis-v" aria-hidden="true" style="margin-left:5px"><\/i><\/div>'
        }
      }, {
        targets: 1,
        searchable: !0,
        orderable: !0,
        render: function(n) {
          return '<div style="display:inline-block;white-space:nowrap"><div class="sprite-small small/' + n + '-small.png"><\/div> ' + n + "<\/div>"
        }
      }, {
        targets: 2,
        searchable: !0,
        orderable: !0,
        render: function(n) {
          return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
        }
      }, {
        targets: 3,
        searchable: !0,
        orderable: !0,
        render: function(n) {
          return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
        }
      }, {
        targets: 4,
        searchable: !0,
        orderable: !0,
        render: function(n) {
          return '<div class="text-right">' + (+n || 0).toFixed(2) + "<\/div>"
        }
      }],
      fnRowCallback: function(n, t) {
        $(n).addClass("balance-" + t[1]);
        $(n).addClass("balanceid-" + t[0])
      },
      fnDrawCallback: function() {
        setupBalanceList()
      }
    });
    $("#userBalances_wrapper .dataTables_scrollHead th").on("click", function() {
      var n = $(this)[0].cellIndex,
        t = $(this).hasClass("sorting_asc") ? "asc" : "desc";
      store.set("balance-sort-col", n);
      store.set("balance-sort-dir", t)
    })
  }
}

function balanceFilter(n, t) {
  if (n.sInstance == "userBalances") {
    var i = t[5] == 0,
      r = t[8] == "true";
    return showFavoriteBalances ? i ? showZeroBalances && r : r : !showZeroBalances && i ? !1 : !0
  }
  return !0
}

function setupBalanceList() {
  var n = $(".stackmenu-content").height(),
    t = $("#userBalances_wrapper .dataTables_scrollHead").height(),
    i = $("#userBalances_wrapper .dataTables_filter").height();
  $("#userBalances_wrapper .dataTables_scrollBody").height(n - (t + i))
}

function updateBalance(n, t) {
  getTradePairBalanceRequest && getTradePairBalanceRequest.readyState != 4 && getTradePairBalanceRequest.abort();
  postJson(actionTradePairBalance, {
    tradePairId: n
  }, function(n) {
    var r, i;
    if (!n.IsError && (t ? (n.Symbol == selectedTradePair.Symbol && $("#userBalanceSell").html(n.Available.toFixed(8)), n.BaseSymbol == selectedTradePair.BaseSymbol && $("#userBalanceBuy").html(n.BaseAvailable.toFixed(8))) : ($("#userBalanceSell").html(n.Available.toFixed(8)), $("#userBalanceBuy").html(n.BaseAvailable.toFixed(8))), sideMenuBalanceTable)) {
      var u = 0,
        f = sideMenuBalanceTable.rows().data(),
        e = $("#userBalances .balance-" + n.Symbol),
        o = $("#userBalances .balance-" + n.BaseSymbol);
      for (r = 0; r < f.length; r++)
        if (i = f[r], i[1] == n.Symbol ? (i[2] = n.Available.toFixed(8), i[3] = n.HeldForOrders.toFixed(8), sideMenuBalanceTable.row(e).invalidate(), u++) : i[1] == n.BaseSymbol && (i[2] = n.BaseAvailable.toFixed(8), i[3] = n.BaseHeldForOrders.toFixed(8), sideMenuBalanceTable.row(o).invalidate(), u++), u == 2) break
    }
  })
}

function clearBalance() {
  $("#userBalanceSell, #userBalanceSell").html("0.00000000")
}

function setupOpenOrders() {
  sideMenuOpenOrdersTable ? sideMenuOpenOrdersTable.columns.adjust() : sideMenuOpenOrdersTable = $("#sideMenuOpenOrders").DataTable({
    dom: "<'row'<'col-sm-12'tr>>",
    order: [
      [0, "asc"]
    ],
    lengthChange: !1,
    processing: !1,
    bServerSide: !1,
    searching: !0,
    paging: !1,
    sort: !0,
    info: !1,
    scrollX: "100%",
    sAjaxSource: actionUserOpenTrades,
    sServerMethod: "POST",
    language: {
      emptyTable: "You have no open orders.",
      sZeroRecords: "You have no open orders."
    },
    columnDefs: [{
      targets: 5,
      visible: !1
    }, {
      targets: 0,
      searchable: !0,
      orderable: !0,
      render: function(n) {
        var t = n.replace("/", "_"),
          i = t.split("_")[0];
        return '<div style="display:inline-block;white-space:nowrap"><div class="sprite-small small/' + i + '-small.png"><\/div><a href="/Exchange?market=' + t + '"> ' + n + "<\/a><\/div>"
      }
    }, {
      targets: 2,
      searchable: !0,
      orderable: !0,
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }, {
      targets: 3,
      searchable: !0,
      orderable: !0,
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }, {
      targets: 4,
      searchable: !1,
      orderable: !1,
      render: function(n, t, i) {
        return '<div class="text-center"><i style="font-size:12px" class="trade-item-remove fa fa-times" data-orderid="' + n + '" data-tradepairid="' + i[5] + '" ><\/i><\/div>'
      }
    }],
    fnRowCallback: function(n, t) {
      $(n).addClass("order-" + t[4])
    },
    fnDrawCallback: function() {
      setupOrderList()
    }
  })
}

function updateOpenOrders(n) {
  var r = sideMenuOpenOrdersTable.rows().data(),
    u = $("#sideMenuOpenOrders .order-" + n.OrderId),
    t, i, f, e;
  if (n.Action == 1 || n.Action == 3) {
    for (t = 0; t < r.length; t++)
      if (i = r[t], i[4] == n.OrderId) {
        sideMenuOpenOrdersTable.row(u).remove().draw();
        break
      }
  } else if (n.Action == 2) {
    for (t = 0; t < r.length; t++)
      if (i = r[t], i[4] == n.OrderId) {
        i[3] = n.Remaining.toFixed(8);
        sideMenuOpenOrdersTable.row(u).invalidate();
        break
      }
  } else n.Action == 0 && (f = n.Type == 0 ? "Buy" : "Sell", e = n.Market, sideMenuOpenOrdersTable.row.add([e, f, n.Rate.toFixed(8), n.Remaining.toFixed(8), n.OrderId, n.TradePairId]).draw())
}

function setupOrderList() {
  var n = $(".stackmenu-content").height(),
    t = $("#sideMenuOpenOrders_wrapper .dataTables_scrollHead").height(),
    i = $("#sideMenuOpenOrders_wrapper .dataTables_filter").height();
  $("#sideMenuOpenOrders_wrapper .dataTables_scrollBody").height(n - (t + i))
}

function setupChatList() {
  var n = $(".chat-menu .chat-footer").height();
  $(".chat-menu .chat-container").height($(".stackmenu-body").height() - n)
}

function enableChat() {
  chatModule.initializeChat()
}

function disableChat() {
  chatModule.destroy()
}

function adjustTableHeaders(n) {
  n && n.columns.adjust()
}

function createSellOrdersTable() {
  sellOrdersTable || ($("#sellorders > tbody").empty(), sellOrdersTable = $("#sellorders").DataTable({
    order: [
      [1, "asc"]
    ],
    lengthChange: !1,
    processing: !1,
    bServerSide: !1,
    searching: !1,
    sort: !1,
    paging: !1,
    info: !1,
    scrollY: "250px",
    scrollCollapse: !1,
    bAutoWidth: !1,
    language: {
      emptyTable: "No sell orders."
    },
    columnDefs: [{
      targets: [1, 2, 3, 4],
      orderable: !1,
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }, {
      targets: 0,
      orderable: !1,
      render: function(n, t, i) {
        var r = (+i[1]).toFixed(8);
        return '<div class="orderbook-indicator" data-price="' + r + '"><i class="fa fa-ellipsis-v" aria-hidden="true"><\/i><\/div>'
      }
    }],
    fnDrawCallback: function(n) {
      n.aoData.length > 0 && (setUserOrderIndicator(), setOrderbookSumTotal("#sellorders"))
    }
  }))
}

function createBuyOrdersTable() {
  buyOrdersTable || ($("#buyorders > tbody").empty(), buyOrdersTable = $("#buyorders").DataTable({
    order: [
      [1, "desc"]
    ],
    lengthChange: !1,
    processing: !1,
    bServerSide: !1,
    searching: !1,
    paging: !1,
    sort: !1,
    info: !1,
    scrollY: "250px",
    scrollCollapse: !1,
    language: {
      emptyTable: "No buy orders."
    },
    columnDefs: [{
      targets: [1, 2, 3, 4],
      orderable: !1,
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }, {
      targets: 0,
      searchable: !1,
      orderable: !1,
      render: function(n, t, i) {
        var r = (+i[1]).toFixed(8);
        return '<div class="orderbook-indicator" data-price="' + r + '"><i class="fa fa-ellipsis-v" aria-hidden="true"><\/i><\/div>'
      }
    }],
    fnDrawCallback: function(n) {
      n.aoData.length > 0 && (setUserOrderIndicator(), setOrderbookSumTotal("#buyorders"))
    }
  }))
}

function updateSellOrdersTable(n) {
  createSellOrdersTable();
  sellOrdersTable.clear().draw();
  n && n.length > 0 && sellOrdersTable.rows.add(n).draw()
}

function clearSellOrdersTable() {
  sellOrdersTable && sellOrdersTable.clear().draw()
}

function updateBuyOrdersTable(n) {
  createBuyOrdersTable();
  buyOrdersTable.clear().draw();
  n && n.length > 0 && buyOrdersTable.rows.add(n).draw()
}

function clearBuyOrdersTable() {
  buyOrdersTable && buyOrdersTable.clear().draw()
}

function setBuyVolumeIndicator() {
  clearTimeout(setBuyVolumeIndicatorTimeout);
  setBuyVolumeIndicatorTimeout = setTimeout(function() {
    updateOrderBookVolumeIndicator("Buy")
  }, 250)
}

function setSellVolumeIndicator() {
  clearTimeout(setSellVolumeIndicatorTimeout);
  setSellVolumeIndicatorTimeout = setTimeout(function() {
    updateOrderBookVolumeIndicator("Sell")
  }, 250)
}

function updateOrderBookVolumeIndicator(n) {
  var i, r, t;
  n == "Buy" ? (i = $("#orderbook-total-buy").text(), i > 0 && $(".panel-container-buy .table-striped > tbody > tr").each(function() {
    var l, a, v, y, p;
    $(this).children().css({
      "background-size": "0px",
      "background-position-x": "0px"
    });
    var b = $(this).children(":nth-child(5)").text() / i * 100,
      n = ~~Math.max($(this).outerWidth() / 100 * b, 5),
      e = $(this).children(":nth-child(1)"),
      o = $(this).children(":nth-child(2)"),
      s = $(this).children(":nth-child(3)"),
      h = $(this).children(":nth-child(4)"),
      c = $(this).children(":nth-child(5)"),
      w = e.outerWidth(),
      f = o.outerWidth(),
      u = s.outerWidth(),
      r = h.outerWidth(),
      t = c.outerWidth();
    n >= t ? (c.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= t + r ? (h.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= t + r + u ? (s.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= t + r + u + f ? (o.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= t + r + u + f + w ? e.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }) : (l = n - (t + r + u + f), e.css({
      "background-size": l + "px",
      "background-position-x": w - l + "px"
    }))) : (a = n - (t + r + u), o.css({
      "background-size": a + "px",
      "background-position-x": f - a + "px"
    }))) : (v = n - (t + r), s.css({
      "background-size": v + "px",
      "background-position-x": u - v + "px"
    }))) : (y = n - t, h.css({
      "background-size": y + "px",
      "background-position-x": r - y + "px"
    }))) : (p = n, c.css({
      "background-size": p + "px",
      "background-position-x": t - p + "px"
    }))
  })) : (r = $("#orderbook-total-sell").text(), r > 0 && (t = 0, $(".panel-container-sell .table-striped > tbody > tr").each(function() {
    var a, v, y, p, w;
    $(this).children().css({
      "background-size": "0px",
      "background-position-x": "0px"
    });
    t = t + +$(this).children(":nth-child(3)").text();
    var b = t / r * 100,
      n = ~~Math.max($(this).outerWidth() / 100 * b, 5),
      e = $(this).children(":nth-child(1)"),
      o = $(this).children(":nth-child(2)"),
      s = $(this).children(":nth-child(3)"),
      h = $(this).children(":nth-child(4)"),
      c = $(this).children(":nth-child(5)"),
      i = e.outerWidth(),
      u = o.outerWidth(),
      f = s.outerWidth(),
      l = h.outerWidth(),
      k = c.outerWidth();
    n >= i ? (e.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= i + u ? (o.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= i + u + f ? (s.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= i + u + f + l ? (h.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }), n >= i + u + f + l + k ? c.css({
      "background-size": "100%",
      "background-position-x": "0px"
    }) : (a = n - (i + u + f + l), c.css({
      "background-size": a + "px",
      "background-position-x": "0px"
    }))) : (v = n - (i + u + f), h.css({
      "background-size": v + "px",
      "background-position-x": "0px"
    }))) : (y = n - (i + u), s.css({
      "background-size": y + "px",
      "background-position-x": "0px"
    }))) : (p = n - i, o.css({
      "background-size": p + "px",
      "background-position-x": "0px"
    }))) : (w = n, e.css({
      "background-size": w + "px",
      "background-position-x": "0px"
    }))
  })))
}

function updateOrderbook(n) {
  var t, i, r, u, f, e;
  if (n.Action == 1) t = n.Type == 0 ? "#sellorders" : "#buyorders", i = $(t + " > tbody td > div").filter(function() {
    return +$(this).text() == n.Rate
  }).closest("tr"), updateOrderbookRow(t, i, n);
  else if (n.Action == 0) {
    if (r = n.Type == 0, t = r ? "#buyorders" : "#sellorders", i = $(t + " > tbody td > div").filter(function() {
        return +$(this).text() == n.Rate
      }).closest("tr"), u = $(t + " > tbody tr:first > td:nth-child(2) > div").text() || "No sell orders.", u === "No sell orders." || u === "No buy orders.") {
      $(t + " > tbody tr:first").remove();
      appendOrderbookRow(t, n);
      return
    }
    f = $(t + " > tbody tr:last > td:nth-child(2) > div").text();
    e = i.find("td:nth-child(2) > div").text();
    i && e == n.Rate ? updateOrderbookRow(t, i, n) : !r && u > n.Rate || r && n.Rate > u ? prependOrderbookRow(t, n) : !r && n.Rate > +f || r && n.Rate < +f ? appendOrderbookRow(t, n) : insertOrderbookRow(t, n)
  } else n.Action == 3 && (t = n.Type == 0 ? "#buyorders" : "#sellorders", i = $(t + " > tbody td > div").filter(function() {
    return +$(this).text() == n.Rate
  }).closest("tr"), updateOrderbookRow(t, i, n))
}

function appendOrderbookRow(n, t) {
  $(n + " > tbody").append(Mustache.render(orderTemplate, {
    highlight: "greenhighlight",
    price: t.Rate.toFixed(8),
    amount: t.Amount.toFixed(8),
    total: (t.Amount * t.Rate).toFixed(8)
  }));
  setOrderbookSumTotal(n)
}

function prependOrderbookRow(n, t) {
  var i = Mustache.render(orderTemplate, {
      highlight: "greenhighlight",
      price: t.Rate.toFixed(8),
      amount: t.Amount.toFixed(8),
      total: (t.Amount * t.Rate).toFixed(8)
    }),
    r = $(n + " > tbody").prepend(i);
  setOrderbookSumTotal(n)
}

function insertOrderbookRow(n, t) {
  var i = $(n + " > tbody td:nth-child(2) > div").filter(function() {
      return t.Type === 0 ? +$(this).text() < t.Rate : +$(this).text() > t.Rate
    }).first().closest("tr"),
    r = Mustache.render(orderTemplate, {
      highlight: "greenhighlight",
      price: t.Rate.toFixed(8),
      amount: t.Amount.toFixed(8),
      total: (t.Amount * t.Rate).toFixed(8)
    });
  i.before(r);
  setOrderbookSumTotal(n)
}

function updateOrderbookRow(n, t, i) {
  var e = t.find("td:nth-child(3) > div"),
    o = t.find("td:nth-child(4) > div"),
    u = +e.text(),
    r = i.Action == 1 || i.Action == 3 ? (u - i.Amount).toFixed(8) : (u + i.Amount).toFixed(8),
    f = (r * i.Rate).toFixed(8);
  isNaN(r) || isNaN(f) || r <= 0 || f <= 0 ? t.remove() : (e.text(r), o.text(f), i.Action == 3 ? highlightRow(t, "red") : r > u && highlightRow(t, "green"));
  setOrderbookSumTotal(n)
}

function setOrderbookSumTotal(n) {
  n === "#buyorders" && setBuySumTotal();
  n === "#sellorders" && setSellSumTotal();
  updateOrderBookChartThrottle()
}

function setSellSumTotal() {
  clearTimeout(setSellSumTotalTimeout);
  setSellSumTotalTimeout = setTimeout(function() {
    calculateOrderbookSum("#sellorders")
  }, 50)
}

function setBuySumTotal() {
  clearTimeout(setBuySumTotalTimeout);
  setBuySumTotalTimeout = setTimeout(function() {
    calculateOrderbookSum("#buyorders")
  }, 50)
}

function calculateOrderbookSum(n) {
  var t = 0,
    i = 0;
  $(n + " > tbody  > tr").each(function() {
    var n = $(this);
    t += +n.find("td:nth-child(4) > div").text();
    i += +n.find("td:nth-child(3) > div").text();
    n.find("td:nth-child(5) > div").text(t.toFixed(8))
  });
  n === "#buyorders" && $("#orderbook-total-buy").html(t.toFixed(8));
  n === "#sellorders" && $("#orderbook-total-sell").html(i.toFixed(8))
}

function createMarketHistoryTable() {
  marketHistoryTable || ($("#markethistory > tbody").empty(), marketHistoryTable = $("#markethistory").DataTable({
    order: [
      [0, "desc"]
    ],
    lengthChange: !1,
    processing: !1,
    bServerSide: !1,
    sort: !1,
    searching: !1,
    paging: !1,
    info: !1,
    scrollY: "300px",
    scrollCollapse: !1,
    bAutoWidth: !1,
    language: {
      emptyTable: "No market history."
    },
    fnRowCallback: function(n, t) {
      $(n).addClass("history-" + t[1])
    },
    columnDefs: [{
      targets: [2, 3, 4],
      orderable: !1,
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }, {
      targets: 0,
      orderable: !1,
      render: function(n) {
        return '<div style="margin-left:8px;white-space: nowrap;">' + toLocalTime(n) + "<\/div>"
      }
    }]
  }))
}

function updateMarketHistoryTable(n) {
  createMarketHistoryTable();
  marketHistoryTable.clear();
  n && n.length > 0 && marketHistoryTable.rows.add(n).draw()
}

function clearMarketHistoryTable() {
  marketHistoryTable && marketHistoryTable.clear().draw()
}

function addMarketHistory(n) {
  var i = $("#markethistory tbody"),
    t;
  i.find("tr > .dataTables_empty").closest("tr").remove();
  t = n.Type === 0 ? "Buy" : "Sell";
  i.prepend(Mustache.render(tradeHistoryTemplate, {
    highlight: n.Type === 0 ? "greenhighlight history-" + t : "redhighlight history-" + t,
    time: toLocalTime(n.Timestamp),
    type: t,
    rate: n.Rate.toFixed(8),
    amount: n.Amount.toFixed(8),
    total: (n.Rate * n.Amount).toFixed(8)
  }))
}

function createUserOpenOrdersTable() {
  userOpenOrdersTable || ($("#useropenorders > tbody").empty(), userOpenOrdersTable = $("#useropenorders").DataTable({
    order: [
      [0, "desc"]
    ],
    lengthChange: !1,
    processing: !1,
    bServerSide: !1,
    searching: !1,
    paging: !1,
    sort: !0,
    info: !1,
    scrollY: "300px",
    scrollCollapse: !0,
    bAutoWidth: !1,
    language: {
      emptyTable: "You have no open orders."
    },
    fnRowCallback: function(n, t) {
      $(n).addClass("openorder-" + t[6]).addClass("history-" + t[1])
    },
    columnDefs: [{
      targets: [2, 3, 4, 5],
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }, {
      targets: 0,
      searchable: !0,
      orderable: !0,
      render: function(n) {
        return '<div style="margin-left:8px;white-space: nowrap;">' + toLocalTime(n) + "<\/div>"
      }
    }, {
      targets: -1,
      searchable: !1,
      orderable: !1,
      render: function(n) {
        return '<div class="text-right"><i class="trade-item-remove fa fa-times" data-orderid="' + n + '"><\/i><\/div>'
      }
    }],
    fnDrawCallback: function(n) {
      n.aoData.length > 0 && setUserOrderIndicator()
    }
  }))
}

function updateUserOpenOrdersTable(n) {
  userOpenOrdersTable.clear().draw();
  n && n.length > 0 && userOpenOrdersTable.rows.add(n).draw()
}

function clearUserOpenOrdersTable() {
  userOpenOrdersTable && userOpenOrdersTable.clear().draw()
}

function updateUserOpenOrders(n) {
  var f, r, t, i, u;
  if (n.Action === 0) f = n.Type === 0 ? "Buy" : "Sell", userOpenOrdersTable.row.add([toLocalTime(n.Timestamp), f, n.Rate.toFixed(8), n.Amount.toFixed(8), n.Remaining.toFixed(8), n.Total.toFixed(8), n.OrderId, n.TradePairId]).draw();
  else if (n.Action === 1 || n.Action === 3) t = $("#useropenorders tbody > tr.openorder-" + n.OrderId), userOpenOrdersTable.row(t).remove().draw();
  else if (n.Action === 2)
    for (r = userOpenOrdersTable.rows().data(), t = $("#useropenorders tbody > tr.openorder-" + n.OrderId), i = 0; i < r.length; i++)
      if (u = r[i], u[6] == n.OrderId) {
        u[4] = n.Remaining.toFixed(8);
        userOpenOrdersTable.row(t).invalidate().draw();
        break
      }
  setUserOrderIndicator()
}

function createUserOrderHistoryTable() {
  userOrderHistoryTable || ($("#userorderhistory > tbody").empty(), userOrderHistoryTable = $("#userorderhistory").DataTable({
    order: [
      [0, "desc"]
    ],
    lengthChange: !1,
    processing: !1,
    bServerSide: !1,
    searching: !1,
    paging: !1,
    sort: !1,
    info: !1,
    scrollY: "300px",
    scrollCollapse: !0,
    bAutoWidth: !1,
    language: {
      emptyTable: "You have no order history."
    },
    fnRowCallback: function(n, t) {
      $(n).addClass("history-" + t[1])
    },
    columnDefs: [{
      targets: [2, 3, 4],
      orderable: !1,
      render: function(n) {
        return '<div class="text-right">' + (+n || 0).toFixed(8) + "<\/div>"
      }
    }, {
      targets: 0,
      searchable: !1,
      orderable: !0,
      render: function(n) {
        return '<div style="margin-left:8px;white-space: nowrap;">' + toLocalTime(n) + "<\/div>"
      }
    }]
  }))
}

function updateUserOrderHistoryTable(n) {
  userOrderHistoryTable.clear().draw();
  n && n.length > 0 && userOrderHistoryTable.rows.add(n).draw()
}

function clearUserOrderHistoryTable() {
  userOrderHistoryTable && userOrderHistoryTable.clear().draw()
}

function addUserTradeHistory(n) {
  var i = $("#userorderhistory tbody"),
    t;
  i.find("tr > .dataTables_empty").closest("tr").remove();
  t = n.Type === 0 ? "Buy" : "Sell";
  i.prepend(Mustache.render(tradeHistoryTemplate, {
    highlight: n.Type === 0 ? "greenhighlight history-" + t : "redhighlight history-" + t,
    time: toLocalTime(n.Timestamp),
    type: t,
    rate: n.Rate.toFixed(8),
    amount: n.Amount.toFixed(8),
    total: (n.Rate * n.Amount).toFixed(8)
  }))
}

function truncateInputDecimals(n, t) {
  var i = new Decimal(n.val());
  i.dp() >= t && n.val(i.toFixed(8))
}

function calculateFee(n) {
  if (selectedTradePair) {
    var r = new Decimal(selectedTradePair.BaseFee),
      u = new Decimal(selectedTradePair.BaseMinTrade),
      h = new Decimal($("#buyprice").val()),
      c = new Decimal($("#buyamount").val()),
      t = h.mul(c),
      f = t.div(100).mul(r),
      e = t.plus(f);
    $("#buyfee").val(f.toFixed(8));
    $("#buytotal").val(t.toFixed(8));
    n && $("#buynettotal").val(e.toFixed(8, Decimal.ROUND_UP));
    $("#buysubmit").prop("disabled", e.lessThan(u));
    var l = new Decimal($("#sellprice").val()),
      a = new Decimal($("#sellamount").val()),
      i = l.mul(a),
      o = i.div(100).mul(r),
      s = i.minus(o);
    $("#sellfee").val(o.toFixed(8));
    $("#selltotal").val(i.toFixed(8));
    n && $("#sellnettotal").val(s.toFixed(8, Decimal.ROUND_UP));
    $("#sellsubmit").prop("disabled", s.lessThan(u))
  }
}

function clearBuySellInputs() {
  $("#buyamount, #buyprice, #buytotal, #sellamount, #sellprice, #selltotal").val(0..toFixed(8));
  calculateFee(!0)
}

function setUserOrderIndicator() {
  clearTimeout(setUserOrderIndicatorTimeout);
  setUserOrderIndicatorTimeout = setTimeout(function() {
    updateUserOrderIndicator()
  }, 200)
}

function updateUserOrderIndicator() {
  var n = $(".orderbook-table > tbody > tr > td:nth-child(1)");
  n.find(".orderbook-indicator").removeClass("orderbook-indicator-active");
  $("#useropenorders > tbody > tr > td:nth-child(3) > div").each(function() {
    n.find('[data-price="' + $(this).text() + '"]').addClass("orderbook-indicator-active")
  })
}

function clearCharts() {
  clearTradeChart();
  clearOrderBookChart();
  clearDistributionChart()
}

function updateSelectedChart() {
  selectedChart == "trade" ? updateTradeChart() : selectedChart == "distribution" && updateDistributionChart()
}

function resizeCharts() {
  resizeTradeChart();
  resizeOrderBookChart();
  resizeDistributionChart()
}

function createOrderBookChart() {
  orderbookChart || (orderbookChart = new Highcharts.Chart({
    chart: {
      type: "area",
      zoomType: "xy",
      renderTo: "depthdata",
      height: fullChart ? 554 : 354,
      backgroundColor: "transparent",
      margin: [25, 0, 15, 0],
      animation: enableChartAnimations
    },
    title: {
      text: ""
    },
    legend: {
      enabled: !1
    },
    exporting: {
      enabled: !1
    },
    xAxis: {
      type: "linear",
      labels: {
        format: "{value:.8f}",
        y: 15,
        autoRotationLimit: 0,
        padding: 10,
        overflow: !1,
        rotation: 0
      },
      crosshair: !0,
      tickLength: 0,
      maxPadding: 0,
      minPadding: 0,
      allowDecimals: !0,
      endOnTick: !0
    },
    yAxis: [{
      type: "linear",
      labels: {
        format: "{value:.8f}",
        align: "right",
        x: -3,
        y: 0,
        enabled: !0
      },
      offset: 0,
      lineWidth: 1,
      tickPosition: "inside",
      opposite: !0,
      showFirstLabel: !1,
      showLastLabel: !1,
      maxPadding: 0,
      minPadding: 0,
      endOnTick: !1,
      showLastLabel: !0
    }, {
      type: "linear",
      labels: {
        format: "{value:.8f}",
        align: "left",
        x: 3,
        y: 0,
        enabled: !0
      },
      offset: 0,
      linkedTo: 0,
      lineWidth: 1,
      tickPosition: "inside",
      opposite: !1,
      showFirstLabel: !1,
      showLastLabel: !1,
      maxPadding: 0,
      minPadding: 0,
      endOnTick: !1,
      showLastLabel: !0
    }],
    credits: {
      enabled: !1
    },
    tooltip: {
      changeDecimals: 8,
      valueDecimals: 8,
      followPointer: !1,
      formatter: function() {
        return Mustache.render(orderbookTooltipTemplate, {
          Price: this.x.toFixed(8),
          Volume: (this.y / this.x).toFixed(8),
          Depth: this.y.toFixed(8),
          Symbol: selectedTradePair.Symbol,
          BaseSymbol: selectedTradePair.BaseSymbol
        })
      }
    },
    series: [{
      name: "Buy",
      data: [],
      color: "#5cb85c",
      fillOpacity: .5,
      lineWidth: 1,
      marker: {
        enabled: !1
      },
      yAxis: 0
    }, {
      name: "Sell",
      color: "#d9534f",
      fillOpacity: .5,
      data: [],
      lineWidth: 1,
      marker: {
        enabled: !1
      },
      yAxis: 0
    }]
  }))
}

function updateOrderBookChart() {
  var n, t, i, r, u;
  if (createOrderBookChart(), n = [], $("#buyorders tbody > tr").each(function() {
      var t = $(this),
        i = +t.find("td:nth-child(2)").text(),
        r = +t.find("td:nth-child(5)").text();
      i && r && n.push([i, r])
    }), t = [], $("#sellorders tbody > tr").each(function() {
      var n = $(this),
        i = +n.find("td:nth-child(2)").text(),
        r = +n.find("td:nth-child(5)").text();
      i && r && t.push([i, r])
    }), i = 0, r = 0, n.length > 0 && t.length > 0 && (u = (+t[0][0] + +n[0][0]) / 2, orderBookChartPercent == 25 && n.length >= 4 && t.length >= 4 ? (n = n.splice(0, n.length / 4), t = t.splice(0, t.length / 4), i = n[n.length - 1][0], r = t[t.length - 1][0]) : orderBookChartPercent == 50 && n.length >= 2 && t.length >= 2 ? (n = n.splice(0, n.length / 2), t = t.splice(0, t.length / 2), i = n[n.length - 1][0], r = t[t.length - 1][0]) : orderBookChartPercent == 100 ? (i = n[n.length - 1][0], r = t[t.length - 1][0]) : (i = Math.max(n[n.length - 1][0], u * .1), r = Math.min(t[t.length - 1][0], u * 1.8)), n.reverse()), n.length == 0 && t.length == 0) {
    $(".chart-orderbook-nodata").show();
    return
  }
  orderbookChart && (orderbookChart.showLoading(), orderbookChart.series[0].setData(n, !1, !1, !1), orderbookChart.series[1].setData(t, !1, !1, !1), orderbookChart.xAxis[0].setExtremes(i, r, !1, !1, !1), orderbookChart.reflow(), orderbookChart.hideLoading(), orderbookChart.update({
    chart: {
      height: fullChart ? 554 : 354,
      width: $("#depthdata").width()
    }
  }, !0))
}

function clearOrderBookChart() {
  orderbookChart && (orderbookChart.series[0].setData([
    [0, 0]
  ], !1, !1, !1), orderbookChart.series[1].setData([
    [0, 0]
  ], !1, !1, !1), orderbookChart.update({
    chart: {
      height: fullChart ? 554 : 354,
      width: $("#depthdata").width()
    }
  }, !0))
}

function resizeOrderBookChart() {
  orderbookChart && (orderbookChart.reflow(), orderbookChart.update({
    chart: {
      height: fullChart ? 554 : 354,
      width: $("#depthdata").width()
    }
  }, !0))
}

function updateOrderBookChartThrottle() {
  selectedChart == "orderbook" && (clearTimeout(updateOrderBookChartThrottleTimeout), updateOrderBookChartThrottleTimeout = setTimeout(function() {
    updateOrderBookChart()
  }, orderBookChartThrottle))
}

function createDistributionChart() {
  distributionChart || (distributionChart = new Highcharts.Chart({
    chart: {
      type: "column",
      renderTo: "distributiondata",
      height: fullChart ? 540 : 340,
      backgroundColor: "transparent",
      margin: [0, 0, 0, 0]
    },
    title: {
      text: ""
    },
    credits: {
      enabled: !1
    },
    exporting: {
      enabled: !1
    },
    xAxis: {
      labels: {
        enabled: !1
      },
      crosshair: !0,
      tickLength: 0,
      maxPadding: 0,
      minPadding: 0
    },
    yAxis: [{
      type: "linear",
      labels: {
        format: "{value:.8f}",
        align: "right",
        x: -3,
        y: 0
      },
      title: {
        enabled: !1
      },
      offset: 0,
      lineWidth: 2,
      tickPosition: "inside",
      opposite: !0,
      showFirstLabel: !1,
      showLastLabel: !1,
      maxPadding: 0,
      minPadding: 0,
      lineColor: "transparent"
    }],
    tooltip: {
      headerFormat: "<span><\/span>",
      pointFormatter: function() {
        return '<span  style="white-space:nowrap">' + this.y.toFixed(8) + " " + selectedTradePair.Symbol + "<\/span>"
      },
      shared: !0,
      useHTML: !0
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0
      }
    },
    series: [{
      name: " ",
      showInLegend: !1,
      minPointLength: 10,
      data: []
    }]
  }))
}

function updateDistributionChart() {
  createDistributionChart();
  distributionChart && ($(".chart-distribution-loading").show(), getData(actionDistributionChart, {
    currencyId: selectedTradePair.CurrencyId,
    count: distributionChartCount
  }, function(n) {
    var t = n ? n.Distribution : [];
    if (t.length == 0) {
      $(".chart-distribution-nodata").show();
      return
    }
    distributionChart && (distributionChart.showLoading(), distributionChart.series[0].setData(t), distributionChart.reflow(), distributionChart.hideLoading(), distributionChart.update({
      chart: {
        height: fullChart ? 540 : 340,
        width: $("#distributiondata").width()
      }
    }, !0));
    $(".chart-distribution-loading").hide()
  }))
}

function clearDistributionChart() {
  distributionChart && distributionChart.series[0].setData([])
}

function resizeDistributionChart() {
  distributionChart && (distributionChart.reflow(), distributionChart.update({
    chart: {
      height: fullChart ? 540 : 340,
      width: $("#distributiondata").width()
    }
  }, !0))
}

function createTradeChart() {
  tradechart = new Highcharts.StockChart({
    chart: {
      height: fullChart ? 554 : 354,
      backgroundColor: "transparent",
      renderTo: "chartdata",
      animation: enableChartAnimations,
      panning: !1,
      margin: [0, 0, 15, 0],
      alignTicks: !1,
      events: {
        redraw: function() {}
      }
    },
    credits: {
      enabled: !1
    },
    navigator: {
      adaptToUpdatedData: !1
    },
    scrollbar: {
      liveRedraw: !1
    },
    exporting: {
      enabled: !1
    },
    xAxis: {
      tickPosition: "inside",
      endOnTick: !0,
      startOnTick: !0,
      crosshair: {
        snap: !0,
        width: 1,
        zIndex: 100
      },
      events: {
        afterSetExtremes: function() {
          var n = tradechart.yAxis[0].getExtremes(),
            i, t;
          n.dataMax != n.dataMin && (i = n.dataMax - n.dataMin, t = i / 20, tradechart.yAxis[0].update({
            floor: n.dataMin - t,
            ceiling: n.dataMax + t
          }, !0), setTimeout(function() {
            toggleFibonacci(fibonacciChart)
          }, 100))
        }
      }
    },
    yAxis: [{
      labels: {
        format: "{value:.8f}",
        align: "right",
        x: -2
      },
      title: {
        text: "",
        enabled: !1
      },
      height: fullChart ? 300 : 225,
      offset: 0,
      lineWidth: .5,
      allowDecimals: !0,
      endOnTick: !1,
      startOnTick: !1,
      showLastLabel: !0,
      showFirstLabel: !0,
      tickPosition: "inside",
      events: {
        afterSetExtremes: function() {}
      }
    }, {
      labels: {
        format: "{value:.8f}",
        align: "right",
        x: -3,
        enabled: !1
      },
      title: {
        text: "Volume",
        enabled: !1
      },
      offset: 0,
      endOnTick: !1,
      startOnTick: !1,
      height: fullChart ? 300 : 225,
      lineWidth: 1,
      tickPosition: "inside",
      gridLineWidth: 0
    }, {
      labels: {
        format: "{value:.8f}",
        align: "right",
        x: -2
      },
      title: {
        text: "MACD",
        enabled: !1
      },
      top: 360,
      height: fullChart ? 100 : 0,
      offset: 0,
      maxPadding: 0,
      minPadding: 0,
      lineWidth: 1,
      gridLineWidth: 1,
      tickPosition: "inside"
    }],
    series: [{
      name: "StockPrice",
      type: "line",
      color: stockPriceChartColor,
      id: "primary",
      yAxis: 0,
      showInLegend: !1,
      lineWidth: stockPriceChart ? 1 : 0,
      animation: enableChartAnimations,
      turboThreshold: 100,
      showInNavigator: !0,
      dataGrouping: {
        enabled: !1
      },
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      states: {
        hover: {
          enabled: !1
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-price").html(this.y.toFixed(8))
        }
      }
    }, {
      type: "candlestick",
      name: selectedMarket,
      yAxis: 0,
      color: candlestickChartDownColor,
      upColor: candlestickChartUpColor,
      upLineColor: candlestickLineColor,
      lineColor: candlestickLineColor,
      showInLegend: !1,
      lineWidth: .5,
      animation: enableChartAnimations,
      turboThreshold: 100,
      showInNavigator: !1,
      visible: candlestickChart,
      dataGrouping: {
        enabled: !1
      },
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      states: {
        hover: {
          enabled: !1
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-open").html(this.open.toFixed(8));
          $("#chart-info-high").html(this.high.toFixed(8));
          $("#chart-info-low").html(this.low.toFixed(8));
          $("#chart-info-close").html(this.close.toFixed(8));
          $("#chart-info-date").html(moment.utc(this.x).local().format("D/MM hh:mm"))
        }
      }
    }, {
      type: "column",
      color: volumeChartColor,
      name: "",
      yAxis: 1,
      zIndex: 0,
      showInLegend: !1,
      animation: enableChartAnimations,
      turboThreshold: 0,
      showInNavigator: !1,
      visible: volumeChart,
      dataGrouping: {
        enabled: !1
      },
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-volume").html(this.y.toFixed(8));
          $("#chart-info-basevolume").html((+this.basev || 0).toFixed(8))
        }
      }
    }, {
      name: "SMA",
      linkedTo: "primary",
      showInLegend: !0,
      type: "trendline",
      algorithm: "SMA",
      color: smaChartColor,
      periods: smaChartValue,
      visible: smaChart,
      showInLegend: !1,
      lineWidth: .5,
      animation: enableChartAnimations,
      turboThreshold: 100,
      showInNavigator: !1,
      enableMouseTracking: !1,
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-SMA").html(this.y.toFixed(8))
        }
      }
    }, {
      name: "EMA 1",
      linkedTo: "primary",
      showInLegend: !0,
      type: "trendline",
      algorithm: "EMA",
      color: ema1ChartColor,
      periods: ema1ChartValue,
      visible: ema1Chart,
      showInLegend: !1,
      lineWidth: .5,
      turboThreshold: 100,
      animation: enableChartAnimations,
      turboThreshold: 0,
      showInNavigator: !1,
      enableMouseTracking: !1,
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-EMA1").html(this.y.toFixed(8))
        }
      }
    }, {
      name: "EMA 2",
      linkedTo: "primary",
      showInLegend: !0,
      type: "trendline",
      algorithm: "EMA",
      color: ema2ChartColor,
      periods: ema2ChartValue,
      visible: ema2Chart,
      showInLegend: !1,
      turboThreshold: 100,
      enableMouseTracking: !1,
      lineWidth: .5,
      animation: enableChartAnimations,
      turboThreshold: 0,
      showInNavigator: !1,
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-EMA2").html(this.y.toFixed(8))
        }
      }
    }, {
      name: "MACD",
      linkedTo: "primary",
      yAxis: 2,
      showInLegend: !0,
      type: "trendline",
      algorithm: "MACD",
      color: macdChartColor,
      showInLegend: !1,
      lineWidth: .5,
      turboThreshold: 100,
      animation: enableChartAnimations,
      turboThreshold: 1e3,
      showInNavigator: !1,
      visible: macdChart,
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-macd").html(this.y.toFixed(8))
        }
      }
    }, {
      name: "Signal line",
      linkedTo: "primary",
      yAxis: 2,
      showInLegend: !0,
      type: "trendline",
      algorithm: "signalLine",
      color: signalChartColor,
      showInLegend: !1,
      lineWidth: .5,
      turboThreshold: 100,
      animation: enableChartAnimations,
      turboThreshold: 1e3,
      showInNavigator: !1,
      visible: signalChart,
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-signal").html(this.y.toFixed(8))
        }
      }
    }, {
      name: "Histogram",
      linkedTo: "primary",
      yAxis: 2,
      color: histogramChartUpColor,
      negativeColor: histogramChartDownColor,
      showInLegend: !0,
      type: "histogram",
      showInLegend: !1,
      lineWidth: .5,
      turboThreshold: 100,
      animation: enableChartAnimations,
      turboThreshold: 1e3,
      showInNavigator: !1,
      visible: histogramChart,
      marker: {
        enabled: !1,
        states: {
          hover: {
            enabled: !1
          }
        }
      },
      tooltip: {
        pointFormatter: function() {
          $("#chart-info-histogram").html(this.y.toFixed(8))
        }
      }
    }],
    tooltip: {
      animation: enableChartAnimations,
      style: {
        display: "none"
      }
    },
    rangeSelector: {
      inputEnabled: !1,
      allButtonsEnabled: !1,
      buttons: [{
        type: "day",
        count: 1,
        text: "",
        dataGrouping: {
          forced: !0,
          enabled: !0
        }
      }, {
        type: "day",
        count: 2,
        text: "",
        dataGrouping: {
          forced: !0,
          enabled: !0
        }
      }, {
        type: "week",
        count: 1,
        text: "",
        dataGrouping: {
          forced: !0,
          enabled: !0
        }
      }, {
        type: "week",
        count: 2,
        text: "",
        dataGrouping: {
          forced: !0,
          enabled: !0
        }
      }, {
        type: "month",
        text: "",
        count: 1,
        dataGrouping: {
          forced: !0,
          enabled: !0,
          units: [
            ["hour", [1]]
          ]
        }
      }, {
        type: "month",
        text: "",
        count: 3,
        dataGrouping: {
          forced: !0,
          enabled: !0,
          units: [
            ["hour", [1]]
          ]
        }
      }, {
        type: "month",
        text: "",
        count: 6,
        dataGrouping: {
          forced: !0,
          enabled: !0,
          units: [
            ["hour", [1]]
          ]
        }
      }, {
        type: "all",
        text: "",
        dataGrouping: {
          forced: !0,
          enabled: !0,
          units: [
            ["hour", [1]]
          ]
        }
      }],
      buttonTheme: {
        width: 0,
        height: 0
      },
      labelStyle: {
        fontSize: "1px"
      },
      selected: 0,
      inputStyle: {
        background: "red"
      }
    }
  })
}

function updateTradeChart() {
  createTradeChart();
  updateSeriesRange(selectedSeriesRange)
}

function clearTradeChart() {
  tradechart && (tradechart.series[0].setData([
    [0, 0, 0, 0, 0, 0]
  ], !1, !1, !1), tradechart.series[1].setData([
    [0, 0, 0, 0, 0, 0]
  ], !1, !1, !1), tradechart.series[2].setData([
    [0, 0]
  ], !1, !1, !1), tradechart.redraw())
}

function resizeTradeChart() {
  tradechart && (tradechart.reflow(), setBorders())
}

function updateChart(n) {
  $(".chart-loading").show();
  var t = n ? n.Candle : [
      [0, 0, 0, 0, 0, 0]
    ],
    i = n ? n.Volume : [
      [0, 0]
    ];
  tradechart && ($(".chart-nodata").hide(), tradechart.series[0].setData(t, !1, !1, !1), tradechart.series[1].setData(t, !1, !1, !1), tradechart.series[2].setData(i, !1, !1, !1), tradechart.redraw(!1), tradechart.rangeSelector.clickButton(selectedSeriesRange, !0, !1), setBorders(), $(".chart-loading").hide(), t.length == 1 && t[0][0] == 0 && $(".chart-nodata").show())
}

function updateChartData(n, t) {
  selectedSeriesRange = n;
  selectedCandleGrouping = getCandleGrouping(n, t);
  $(".chart-nodata").hide();
  $(".chart-loading").show();
  getTradePairChartRequest && getTradePairChartRequest.readyState != 4 && getTradePairChartRequest.abort();
  getTradePairChartRequest = getData(actionTradeChart, {
    tradePairId: selectedTradePair.TradePairId,
    dataRange: selectedSeriesRange,
    dataGroup: selectedCandleGrouping
  }, function(n) {
    updateChart(n)
  })
}

function toggleFullChart() {
  if (macdChart || signalChart || histogramChart) {
    fullChart = !0;
    tradechart.yAxis[0].height != 300 && (tradechart.yAxis[0].update({
      height: 300
    }, !1), tradechart.yAxis[1].update({
      height: 300
    }, !1), tradechart.yAxis[2].update({
      height: 100
    }, !1), tradechart.update({
      chart: {
        height: 554
      }
    }, !1), $(".chart-container").height(565), tradechart.redraw(!0), toggleFibonacci(fibonacciChart), setBorders());
    return
  }
  fullChart = !1;
  tradechart.yAxis[0].height != 225 && (tradechart.yAxis[0].update({
    height: 225
  }, !1), tradechart.yAxis[1].update({
    height: 225
  }, !1), tradechart.yAxis[2].update({
    height: 0
  }, !1), tradechart.update({
    chart: {
      height: 354
    }
  }, !1), $(".chart-container").height(365), tradechart.redraw(!0), toggleFibonacci(fibonacciChart), setBorders())
}

function updateSeriesRange(n) {
  tradechart && ($(".chart-candles-group > .btn-default").removeClass("active").attr("disabled", "disabled"), n == 0 ? $(".chart-candles-btn15, .chart-candles-btn30, .chart-candles-btn60, .chart-candles-btn120").removeAttr("disabled") : n == 1 ? $(".chart-candles-btn15, .chart-candles-btn30, .chart-candles-btn60, .chart-candles-btn120").removeAttr("disabled") : n == 2 ? $(".chart-candles-btn60, .chart-candles-btn120, .chart-candles-btn240, .chart-candles-btn720").removeAttr("disabled") : n == 3 ? $(".chart-candles-btn120, .chart-candles-btn240, .chart-candles-btn720").removeAttr("disabled") : n == 4 ? $(".chart-candles-btn240, .chart-candles-btn720, .chart-candles-btn1440").removeAttr("disabled") : n == 5 ? $(".chart-candles-btn240, .chart-candles-btn720, .chart-candles-btn1440, .chart-candles-btn10080").removeAttr("disabled") : n == 6 ? $(".chart-candles-btn720, .chart-candles-btn1440, .chart-candles-btn10080").removeAttr("disabled") : n == 7 && $(".chart-candles-btn1440, .chart-candles-btn10080").removeAttr("disabled"), $(".chart-range-group > .btn-default").removeClass("active"), $(".chart-range-btn" + n).addClass("active"), updateChartData(n, selectedCandleGrouping), $(".chart-candles-btn" + selectedCandleGrouping).addClass("active"))
}

function getCandleGrouping(n, t) {
  return n == 0 && t > 120 ? 30 : n == 1 && t > 120 ? 60 : n == 2 && (t > 720 || t < 60) ? 120 : n == 3 && (t > 720 || t < 120) ? 120 : n == 4 && (t > 1440 || t < 240) ? 240 : n == 5 && t < 240 ? 720 : n == 6 && t < 720 ? 720 : n == 7 && t < 1440 ? 1440 : t
}

function toggleSeries(n, t, i) {
  n == 0 && toggleStockPrice(i);
  n == 1 && toggleCandleStick(i);
  n == 2 && toggleVolume(i);
  n == 3 && (smaChartValue = t, toggleSMA(i, t));
  n == 4 && (ema1ChartValue = t, toggleEMA1(i, t));
  n == 5 && (ema2ChartValue = t, toggleEMA2(i, t));
  n == 6 && toggleMACD(i);
  n == 7 && toggleSignal(i);
  n == 8 && toggleHistogram(i);
  n == 9 && toggleFibonacci(i)
}

function toggleCandleStick(n) {
  if (candlestickChart = n, n) {
    tradechart.series[1].show();
    $(".chart-candlestick-item").show();
    toggleFibonacci(fibonacciChart);
    return
  }
  tradechart.series[1].hide();
  $(".chart-candlestick-item").hide();
  toggleFibonacci(fibonacciChart)
}

function toggleStockPrice(n) {
  if (stockPriceChart = n, n) {
    tradechart.series[0].update({
      lineWidth: 1
    });
    $(".chart-stockprice-item").show();
    return
  }
  tradechart.series[0].update({
    lineWidth: 0
  });
  $(".chart-stockprice-item").hide()
}

function toggleVolume(n) {
  if (volumeChart = n, n) {
    tradechart.series[2].show();
    $(".chart-volume-item").show();
    return
  }
  tradechart.series[2].hide();
  $(".chart-volume-item").hide()
}

function toggleSMA(n, t) {
  if (smaChart = n, smaChartValue = t, tradechart.series[3].update({
      periods: smaChartValue
    }), n) {
    tradechart.series[3].show();
    $(".chart-sma-item").show();
    return
  }
  tradechart.series[3].hide();
  $(".chart-sma-item").hide()
}

function toggleEMA1(n, t) {
  if (ema1Chart = n, ema1ChartValue = t, tradechart.series[4].update({
      periods: ema1ChartValue
    }), n) {
    tradechart.series[4].show();
    $(".chart-ema1-item").show();
    return
  }
  tradechart.series[4].hide();
  $(".chart-ema1-item").hide()
}

function toggleEMA2(n, t) {
  if (ema2Chart = n, ema2ChartValue = t, tradechart.series[5].update({
      periods: ema2ChartValue
    }), n) {
    tradechart.series[5].show();
    $(".chart-ema2-item").show();
    return
  }
  tradechart.series[5].hide();
  $(".chart-ema2-item").hide()
}

function toggleMACD(n) {
  if (n) {
    macdChart = !0;
    tradechart.series[6].show();
    toggleFullChart();
    $(".chart-macd-item").show();
    return
  }
  macdChart = !1;
  tradechart.series[6].hide();
  toggleFullChart();
  $(".chart-macd-item").hide()
}

function toggleSignal(n) {
  if (n) {
    signalChart = !0;
    tradechart.series[7].show();
    toggleFullChart();
    $(".chart-signal-item").show();
    return
  }
  signalChart = !1;
  tradechart.series[7].hide();
  toggleFullChart();
  $(".chart-signal-item").hide()
}

function toggleHistogram(n) {
  if (n) {
    histogramChart = !0;
    tradechart.series[8].show();
    toggleFullChart();
    $(".chart-histogram-item").show();
    return
  }
  histogramChart = !1;
  tradechart.series[8].hide();
  toggleFullChart();
  $(".chart-histogram-item").hide()
}

function toggleFibonacci(n) {
  var u, o, t, b, k, p, f, i, ut, ft, e, r;
  if (fibonacciChart = n, n && (candlestickChart || stockPriceChart)) {
    if (t = tradechart.yAxis[0].getExtremes(), b = t.dataMax != t.dataMin, b) {
      if (k = candlestickChart ? 1 : 0, p = tradechart.series[k].points.length, candlestickChart)
        for (f = p; f > 0; f--)(i = tradechart.series[1].points[f], i != null) && ((!u || i.x < u) && i.low == t.dataMin && (u = i.x), o || i.high != t.dataMax || (o = i.x));
      if (stockPriceChart && !candlestickChart)
        for (f = p; f > 0; f--)(i = tradechart.series[0].points[f], i != null) && ((!u || i.x < u) && i.y == t.dataMin && (u = i.x), o || i.y != t.dataMax || (o = i.x));
      var et = t.dataMax - t.dataMin,
        c = et / 100,
        s = tradechart.yAxis[0].toPixels(t.dataMin),
        l = tradechart.yAxis[0].toPixels(t.dataMin + c * 23.6),
        a = tradechart.yAxis[0].toPixels(t.dataMin + c * 38.2),
        v = tradechart.yAxis[0].toPixels(t.dataMin + c * 50),
        y = tradechart.yAxis[0].toPixels(t.dataMin + c * 61.8),
        h = tradechart.yAxis[0].toPixels(t.dataMax),
        d = ["M", tradechart.plotLeft, s, "L", tradechart.plotLeft + tradechart.plotWidth, s],
        g = ["M", tradechart.plotLeft, l, "L", tradechart.plotLeft + tradechart.plotWidth, l],
        nt = ["M", tradechart.plotLeft, a, "L", tradechart.plotLeft + tradechart.plotWidth, a],
        tt = ["M", tradechart.plotLeft, v, "L", tradechart.plotLeft + tradechart.plotWidth, v],
        it = ["M", tradechart.plotLeft, y, "L", tradechart.plotLeft + tradechart.plotWidth, y],
        rt = ["M", tradechart.plotLeft, h, "L", tradechart.plotLeft + tradechart.plotWidth, h],
        w;
      u && o && (ut = tradechart.xAxis[0].toPixels(u), ft = tradechart.xAxis[0].toPixels(o), w = ["M", ft, h, "L", ut, s]);
      e = {
        "stroke-width": .5,
        stroke: fibonacciChartColor,
        zIndex: 100
      };
      r = {
        zIndex: 100,
        css: {
          fontSize: "11px",
          color: fibonacciChartColor
        }
      };
      tradechart.fib1 ? (tradechart.fib1.attr({
        d: d
      }), tradechart.fib1Label.attr({
        y: s - 2,
        text: "0%"
      })) : (tradechart.fib1 = tradechart.renderer.path(d).attr(e).add(), tradechart.fib1Label = tradechart.renderer.text("0%", 0, s - 2).css(r.css).attr(r).add());
      tradechart.fib2 ? (tradechart.fib2.attr({
        d: g
      }), tradechart.fib2Label.attr({
        y: l - 2,
        text: "23.6%"
      })) : (tradechart.fib2 = tradechart.renderer.path(g).attr(e).add(), tradechart.fib2Label = tradechart.renderer.text("23.6%", 0, l - 2).css(r.css).attr(r).add());
      tradechart.fib3 ? (tradechart.fib3.attr({
        d: nt
      }), tradechart.fib3Label.attr({
        y: a - 2,
        text: "38.2%"
      })) : (tradechart.fib3 = tradechart.renderer.path(nt).attr(e).add(), tradechart.fib3Label = tradechart.renderer.text("38.2%", 0, a - 2).css(r.css).attr(r).add());
      tradechart.fib4 ? (tradechart.fib4.attr({
        d: tt
      }), tradechart.fib4Label.attr({
        y: v - 2,
        text: "50%"
      })) : (tradechart.fib4 = tradechart.renderer.path(tt).attr(e).add(), tradechart.fib4Label = tradechart.renderer.text("50%", 0, v - 2).css(r.css).attr(r).add());
      tradechart.fib5 ? (tradechart.fib5.attr({
        d: it
      }), tradechart.fib5Label.attr({
        y: y - 2,
        text: "61.8%"
      })) : (tradechart.fib5 = tradechart.renderer.path(it).attr(e).add(), tradechart.fib5Label = tradechart.renderer.text("61.8%", 0, y - 2).css(r.css).attr(r).add());
      tradechart.fib6 ? (tradechart.fib6.attr({
        d: rt
      }), tradechart.fib6Label.attr({
        y: h - 2,
        text: "100%"
      })) : (tradechart.fib6 = tradechart.renderer.path(rt).attr(e).add(), tradechart.fib6Label = tradechart.renderer.text("100%", 0, h - 2).css(r.css).attr(r).add());
      tradechart.fibd ? tradechart.fibd.attr({
        d: w
      }) : tradechart.fibd = tradechart.renderer.path(w).attr(e).add()
    }
    return
  }
  tradechart.fibd && (tradechart.fibd.attr({
    d: []
  }), tradechart.fib1.attr({
    d: []
  }), tradechart.fib2.attr({
    d: []
  }), tradechart.fib3.attr({
    d: []
  }), tradechart.fib4.attr({
    d: []
  }), tradechart.fib5.attr({
    d: []
  }), tradechart.fib6.attr({
    d: []
  }), tradechart.fib1Label.attr({
    y: 0,
    text: ""
  }), tradechart.fib2Label.attr({
    y: 0,
    text: ""
  }), tradechart.fib3Label.attr({
    y: 0,
    text: ""
  }), tradechart.fib4Label.attr({
    y: 0,
    text: ""
  }), tradechart.fib5Label.attr({
    y: 0,
    text: ""
  }), tradechart.fib6Label.attr({
    y: 0,
    text: ""
  }))
}

function setBorders() {
  var n = {
      "stroke-width": .2,
      stroke: chartBorderColor,
      zIndex: 200
    },
    r = ["M", tradechart.plotLeft, 32, "L", tradechart.plotLeft + tradechart.plotWidth, 32],
    t, i;
  tradechart.topBorder ? tradechart.topBorder.attr({
    d: r
  }) : tradechart.topBorder = tradechart.renderer.path(r).attr(n).add();
  fullChart ? (t = ["M", tradechart.plotLeft, 336, "L", tradechart.plotLeft + tradechart.plotWidth, 336], i = ["M", tradechart.plotLeft, 360, "L", tradechart.plotLeft + tradechart.plotWidth, 360], tradechart.bottomBorder ? (tradechart.bottomBorder.attr({
    d: t
  }), tradechart.bottomBorder2.attr({
    d: i
  })) : (tradechart.bottomBorder = tradechart.renderer.path(t).attr(n).add(), tradechart.bottomBorder2 = tradechart.renderer.path(i).attr(n).add())) : tradechart.bottomBorder && (tradechart.bottomBorder.attr({
    d: []
  }), tradechart.bottomBorder2.attr({
    d: []
  }))
}

function drawHorizontalCrosshair(n) {
  var e = n.pageX,
    t = n.offsetY;
  path = ["M", tradechart.plotLeft, t, "L", tradechart.plotLeft + tradechart.plotWidth, t];
  var i, r = t - tradechart.plotTop,
    u = tradechart.yAxis[0].len,
    f = tradechart.yAxis[2].len;
  if (r >= 0 && r <= u) i = tradechart.yAxis[0].toValue(t).toFixed(8);
  else if (r >= 325 && r <= 325 + f) i = tradechart.yAxis[2].toValue(t).toFixed(8);
  else {
    tradechart.crossLines && tradechart.crossLabel && (tradechart.crossLabel.attr({
      y: 0,
      text: ""
    }), tradechart.crossLines.attr({
      d: []
    }));
    return
  }
  i && (tradechart.crossLines ? tradechart.crossLines.attr({
    d: path
  }) : tradechart.crossLines = tradechart.renderer.path(path).attr({
    "stroke-width": .2,
    stroke: chartCrossHairColor,
    zIndex: 100
  }).add(), tradechart.crossLabel ? tradechart.crossLabel.attr({
    x: tradechart.plotWidth - 2,
    y: t - 2,
    text: i
  }) : tradechart.crossLabel = tradechart.renderer.text(i, tradechart.plotWidth - 2, t - 2).css({
    fontSize: "11px",
    color: chartTextColor
  }).attr({
    zIndex: 100,
    align: "right"
  }).add())
}

function saveChartSettings() {
  var n = "";
  n += volumeChart ? "1," : "0,";
  n += stockPriceChart ? "1," : "0,";
  n += candlestickChart ? "1," : "0,";
  n += macdChart ? "1," : "0,";
  n += signalChart ? "1," : "0,";
  n += histogramChart ? "1," : "0,";
  n += fibonacciChart ? "1," : "0,";
  n += smaChart ? "1:" + smaChartValue + "," : "0:" + smaChartValue + ",";
  n += ema1Chart ? "1:" + ema1ChartValue + "," : "0:" + ema1ChartValue + ",";
  n += ema2Chart ? "1:" + ema2ChartValue + "," : "0:" + ema2ChartValue + ",";
  n += distributionChartCount + ",";
  n += orderBookChartPercent;
  postJson(actionUpdateChartSettings, {
    settings: n
  }, function(n) {
    notify(n.Success ? "Settings Saved" : "Save Failed", n.Message)
  })
}
var tradechart, orderbookChart, orderBookChartThrottle = 250,
  distributionChart, selectedChart = "trade",
  selectedSeriesRange = 1,
  selectedCandleGrouping = 60,
  chartTextColor = "#666666",
  chartBorderColor = "#000000",
  chartCrossHairColor = "#000000",
  candlestickLineColor = "#000000",
  candlestickChartUpColor = "#5cb85c",
  candlestickChartDownColor = "#ee5f5b",
  stockPriceChartColor = "#4286f4",
  volumeChartColor = "rgba(0, 0, 0, 0.2)",
  macdChartColor = "#3b7249",
  signalChartColor = "#d8ae13",
  histogramChartUpColor = "#5cb85c",
  histogramChartDownColor = "#ee5f5b",
  smaChartColor = "#4a788c",
  ema1ChartColor = "orange",
  ema2ChartColor = "purple",
  fibonacciChartColor = "#91353e",
  orderTemplate = $("#orderTemplate").html(),
  tradeHistoryTemplate = $("#tradeHistoryTemplate").html(),
  orderbookTooltipTemplate = $("#orderbookTooltipTemplate").html(),
  marketDataSet = [],
  marketSummaryTables = {},
  isSideMenuOpen = !0,
  chatModule = new ChatModule(".chat-menu"),
  favoriteMarkets = store.get("favorite-market") || [],
  showFavoriteMarkets = store.get("favorite-market-enabled") || !1,
  marketTableSortColumn = store.get("market-sort-col") || 5,
  marketTableSortDirection = store.get("market-sort-dir") || "desc",
  balanceTableSortColumn = store.get("balance-sort-col") || 1,
  balanceTableSortDirection = store.get("balance-sort-dir") || "asc",
  disableTradeConfirmationModal = store.get("disable-trade-confirmation") || !1,
  sideMenuBalanceTable, sideMenuOpenOrdersTable, buyOrdersTable, sellOrdersTable, marketHistoryTable, userOpenOrdersTable, userOrderHistoryTable, marketTable, getTradePairDataRequest, getUserTradePairDataRequest, getTradePairBalanceRequest, getTradePairChartRequest, getCurrencySummaryRequest, updateMarketFavoritesTimeout, setBuyVolumeIndicatorTimeout, setSellVolumeIndicatorTimeout, setSellSumTotalTimeout, setBuySumTotalTimeout, setUserOrderIndicatorTimeout, updateOrderBookChartThrottleTimeout;
$("#market-favorite-chk").attr("checked", showFavoriteMarkets);
$("#market-list > tbody").empty();
marketTable = $("#market-list").DataTable({
  dom: "<'row'<'col-sm-12'tr>>",
  order: [
    [marketTableSortColumn, marketTableSortDirection]
  ],
  lengthChange: !1,
  processing: !1,
  bServerSide: !1,
  searching: !0,
  paging: !1,
  scrollX: "100%",
  autoWidth: !1,
  sServerMethod: "POST",
  info: !1,
  language: {
    emptyTable: "Loading markets...",
    sZeroRecords: "No markets found.",
    search: "",
    searchPlaceholder: "Search markets"
  },
  columnDefs: [{
    targets: [1, 2, 7, 8, 9, 10],
    visible: !1
  }, {
    targets: [0],
    visible: !0,
    sortable: !1,
    render: function(n, t, i) {
      return '<div class="market-favorite market-favorite-' + i[1] + '" data-marketid="' + i[1] + '"><i class="fa fa-ellipsis-v" aria-hidden="true" style="margin-left:5px"><\/i><\/div>'
    }
  }, {
    targets: [3],
    visible: !0,
    render: function(n) {
      return '<div style="display:inline-block"><div class="sprite-small small/' + n + '-small.png"><\/div> ' + n + "<\/div>"
    }
  }, {
    targets: [4],
    visible: !0,
    render: function(n, t, i) {
      return '<div class="text-right">' + (+i[9] || 0).toFixed(8) + "<\/div>"
    }
  }, {
    targets: [5],
    visible: !0,
    render: function(n) {
      return '<div class="text-right">' + (+n || 0).toFixed(2) + "<\/div>"
    }
  }, {
    targets: [6],
    visible: !0,
    render: function(n, t, i) {
      return '<div class="text-right ' + (i[4] > 0 ? "text-success" : i[4] < 0 ? "text-danger" : "") + '">' + (+i[4] || 0).toFixed(2) + "%<\/div>"
    }
  }],
  fnRowCallback: function(n, t) {
    var i = t[1] == selectedTradePair.TradePairId ? "info text-bold " : "";
    $(n).data("name", t[2]).data("tradepairid", t[1]).data("market", t[3] + "_" + currentBaseMarket).addClass(i + "currencyData-tradepair currencyData-tradepair-" + t[1])
  }
});
changeBaseMarket(currentBaseMarket);
selectedTradePair.TradePairId && getTradePairInfo(selectedTradePair.TradePairId);
$("#wrapper").on("click", ".currencyData-btn", function() {
  var n = $(this);
  currentBaseMarket = n.data("currency");
  changeBaseMarket(currentBaseMarket);
  marketSummaryView && History.pushState({}, "Market - Cryptopia", "?baseMarket=" + currentBaseMarket)
});
$("#market-list_wrapper").on("click", ".currencyData-tradepair", function() {
  var n = $(this),
    t = n.data("market"),
    i;
  updateTitle({
    Symbol: t.split("_")[0],
    BaseSymbol: currentBaseMarket,
    Name: n.data("name")
  }, !0);
  marketSummaryView && ($("#market-main").show(), $("#market-summary").hide(), marketSummaryView = !1);
  i = n.data("tradepairid");
  $(".currencyData-tradepair").removeClass("info text-bold");
  n.addClass("info text-bold");
  getTradePairInfo(n.data("tradepairid"));
  t = n.data("market");
  History.pushState({}, "Market - Cryptopia", "?market=" + t)
});
$("#markets-search").keyup(function() {
  marketTable.search($(this).val()).draw()
});
$("#market-list_wrapper .dataTables_scrollHead th").on("click", function() {
  var n = $(this)[0].cellIndex + 2,
    t = $(this).hasClass("sorting_asc") ? "asc" : "desc";
  store.set("market-sort-col", n);
  store.set("market-sort-dir", t)
});
$("#market-favorite-chk").click(function() {
  var n = $(this);
  showFavoriteMarkets = n.is(":checked");
  store.set("favorite-market-enabled", showFavoriteMarkets);
  marketTable.draw()
});
$("#market-list").on("click", ".market-favorite", function(n) {
  var t, r, i;
  if (n.stopPropagation(), t = $(this), r = t.data("marketid"), t.hasClass("market-favorite-active"))
    for (t.removeClass("market-favorite-active"), i = favoriteMarkets.length - 1; i >= 0; i--) favoriteMarkets[i] === r && (favoriteMarkets.splice(i, 1), store.set("favorite-market", favoriteMarkets));
  else t.addClass("market-favorite-active"), favoriteMarkets.push(r), store.set("favorite-market", favoriteMarkets);
  showFavoriteMarkets && marketTable.draw()
});
$(".menu-btn").on("click", function() {
  toggleSideMenu()
});
$(".exchange-menu-btn").on("click", function() {
  $(".balance-menu, .orders-menu, .chat-menu").hide();
  $(".balance-menu-btn, .orders-menu-btn, .chat-menu-btn").removeClass("active");
  $(".exchange-menu").show();
  $(".exchange-menu-btn").addClass("active");
  isSideMenuOpen || toggleSideMenu()
});
$(".balance-menu-btn").on("click", function() {
  $(".exchange-menu, .orders-menu, .chat-menu").hide();
  $(".exchange-menu-btn, .orders-menu-btn, .chat-menu-btn").removeClass("active");
  $(".balance-menu").show();
  $(".balance-menu-btn").addClass("active");
  isSideMenuOpen || toggleSideMenu();
  setupBalances()
});
$(".orders-menu-btn").on("click", function() {
  $(".balance-menu, .exchange-menu, .chat-menu").hide();
  $(".balance-menu-btn, .exchange-menu-btn, .chat-menu-btn").removeClass("active");
  $(".orders-menu").show();
  $(".orders-menu-btn").addClass("active");
  isSideMenuOpen || toggleSideMenu();
  setupOpenOrders()
});
$(".chat-menu-btn").on("click", function() {
  $(".balance-menu, .exchange-menu, .orders-menu").hide();
  $(".balance-menu-btn, .exchange-menu-btn, .orders-menu-btn").removeClass("active");
  $(".chat-menu").show();
  $(".chat-menu-btn").addClass("active");
  isSideMenuOpen || toggleSideMenu();
  setupChatList();
  enableChat()
});
notificationHub.client.SendTradeDataUpdate = function(n) {
  n.DataType == 3 && updateMarketItem(n);
  n.TradePairId == selectedTradePair.TradePairId && (n.DataType == 0 ? updateOrderbook(n) : n.DataType == 1 ? addMarketHistory(n) : n.DataType == 3 && updateTicker(n))
};
notificationHub.client.SendUserTradeDataUpdate = function(n) {
  n.DataType == 2 && sideMenuOpenOrdersTable && updateOpenOrders(n);
  n.DataType == 4 && updateBalance(n.TradePairId, !0);
  selectedTradePair && n.TradePairId == selectedTradePair.TradePairId && (n.DataType == 1 && addUserTradeHistory(n), n.DataType == 2 && updateUserOpenOrders(n))
};
$("#balance-search").keyup(function() {
  sideMenuBalanceTable.search($(this).val()).draw()
});
$("#sideMenu-balance-hidezero").click(function() {
  var n = $(this).is(":checked");
  postJson(actionHideZeroBalances, {
    hide: n
  });
  showZeroBalances = !n;
  sideMenuBalanceTable.draw()
});
$("#sideMenu-balance-favorites").click(function() {
  var n = $(this).is(":checked");
  postJson(actionShowFavoriteBalances, {
    show: n
  });
  showFavoriteBalances = n;
  sideMenuBalanceTable.draw()
});
$("#userBalances").on("click", ".balance-favorite", function(n) {
  var t, i;
  n.stopPropagation();
  var r = $(this).data("balanceid"),
    u = sideMenuBalanceTable.rows().data(),
    f = $("#userBalances .balanceid-" + r);
  for (t = 0; t < u.length; t++)
    if (i = u[t], i[0] == r) {
      i[8] = !i[8];
      sideMenuBalanceTable.row(f).invalidate().draw();
      postJson(actionSetFavoriteBalance, {
        currencyId: r
      });
      break
    }
});
$.fn.dataTable.ext.search.push(balanceFilter);
$("#openorders-search").keyup(function() {
  sideMenuOpenOrdersTable.search($(this).val()).draw()
});
$.fn.dataTable.ext.search.push(marketFavoriteFilter);
$(window).resize(function() {
  setupMarketList(!0);
  setupChatList();
  setupBalanceList();
  setupOrderList();
  marketSummaryView ? adjustTableHeaders(marketSummaryTables[currentBaseMarket]) : (adjustTableHeaders(buyOrdersTable), adjustTableHeaders(sellOrdersTable), adjustTableHeaders(marketHistoryTable), adjustTableHeaders(userOpenOrdersTable), adjustTableHeaders(userOrderHistoryTable), setSellVolumeIndicator(), setBuyVolumeIndicator(), resizeCharts())
});
$(document).on("click", ".dropdown-menu", function(n) {
  n.stopPropagation()
});
$("#useropenorders, #sideMenuOpenOrders").on("click", ".trade-item-remove", function() {
  var n = $(this).data("orderid"),
    t = $(this).data("tradepairid") || selectedTradePair.TradePairId;
  n > 0 && t > 0 && cancelOrder(n, t)
});
$(".panel-container-useropenorders").on("click", ".trade-items-remove", function() {
  var n = selectedTradePair.TradePairId;
  n > 0 && cancelTradePairOrders(n)
});
$("#buysubmit").on("click", function() {
  var e = $(this),
    n = new Decimal($("#buyprice").val()),
    t = new Decimal($("#buyamount").val()),
    i = new Decimal($("#buytotal").val()),
    r = new Decimal($("#userBalanceBuy").text()),
    f = new Decimal(selectedTradePair.BaseMinTrade),
    u;
  if (n.lessThan(1e-8)) {
    sendNotification("Trade Notification", "Invalid trade price, minimum price is 0.00000001", 2);
    return
  }
  if (t.lessThan(1e-8)) {
    sendNotification("Trade Notification", "Invalid trade amount, minimum amount is 0.00000001", 2);
    return
  }
  if (i.lessThan(f)) {
    sendNotification("Trade Notification", "Your trade total must be at least " + selectedTradePair.BaseMinTrade + " " + selectedTradePair.BaseSymbol, 2);
    return
  }
  if (r.isZero() || i.greaterThan(r)) {
    sendNotification("Trade Notification", "Insufficient " + selectedTradePair.BaseSymbol + " funds.", 2);
    return
  }
  u = {
    IsBuy: !0,
    Price: n.toFixed(8),
    Amount: t.toFixed(8),
    TradePairId: selectedTradePair.TradePairId
  };
  $(".buysell-button-loading").show();
  $("#sellsubmit, #buysubmit").attr("disabled", "disabled");
  sendNotification("Trade Notification", "Buy order submitted");
  postJson(actionSubmitTrade, u, function(n) {
    $(".buysell-button-loading").hide();
    $("#sellsubmit, #buysubmit").removeAttr("disabled", "disabled");
    n.Message && sendNotification("Trade Notification", n.Message, 2)
  })
});
$("#sellsubmit").on("click", function() {
  var e = $(this),
    t = new Decimal($("#sellprice").val()),
    n = new Decimal($("#sellamount").val()),
    u = new Decimal($("#selltotal").val()),
    i = new Decimal($("#userBalanceSell").text()),
    f = new Decimal(selectedTradePair.BaseMinTrade),
    r;
  if (t.lessThan(1e-8)) {
    sendNotification("Trade Notification", "Invalid trade price, minimum price is 0.00000001", 2);
    return
  }
  if (n.lessThan(1e-8)) {
    sendNotification("Trade Notification", "Invalid trade amount, minimum amount is 0.00000001", 2);
    return
  }
  if (u.lessThan(f)) {
    sendNotification("Trade Notification", "Your trade total must be at least " + selectedTradePair.BaseMinTrade + " " + selectedTradePair.BaseSymbol, 2);
    return
  }
  if (i.isZero() || n.greaterThan(i)) {
    sendNotification("Trade Notification", "Insufficient " + selectedTradePair.Symbol + " funds.", 2);
    return
  }
  r = {
    IsBuy: !1,
    Price: t.toFixed(8),
    Amount: n.toFixed(8),
    TradePairId: selectedTradePair.TradePairId
  };
  $(".buysell-button-loading").show();
  $("#sellsubmit, #buysubmit").attr("disabled", "disabled");
  sendNotification("Trade Notification", "Sell order submitted");
  postJson(actionSubmitTrade, r, function(n) {
    $(".buysell-button-loading").hide();
    $("#sellsubmit, #buysubmit").removeAttr("disabled", "disabled");
    n.Message && sendNotification("Trade Notification", n.Message, 2)
  })
});
$("#buyamount").on("keyup paste change", function() {
  var n = new Decimal($("#buyprice").val()),
    t = new Decimal($(this).val()),
    i = $("#buytotal"),
    r = n.mul(t);
  i.val(r.toFixed(8))
});
$("#buyprice").on("keyup paste change", function() {
  var n = new Decimal($(this).val()),
    t = new Decimal($("#buyamount").val()),
    i = n.mul(t),
    r = $("#buytotal");
  r.val(i.toFixed(8))
});
$("#buytotal").on("keyup paste change", function() {
  var n = new Decimal($(this).val()),
    t = new Decimal($("#buyprice").val()),
    i = n.div(t),
    r = $("#buyamount");
  r.val(i.toFixed(8))
});
$("#sellamount").on("keyup paste change", function() {
  var n = new Decimal($("#sellprice").val()),
    t = new Decimal($(this).val()),
    i = $("#selltotal");
  i.val(n.mul(t).toFixed(8))
});
$("#sellprice").on("keyup paste change", function() {
  var n = new Decimal($(this).val()),
    t = new Decimal($("#sellamount").val()),
    i = $("#selltotal");
  i.val(n.mul(t).toFixed(8))
});
$("#selltotal").on("keyup paste change", function() {
  var n = new Decimal($(this).val()),
    t = new Decimal($("#sellprice").val()),
    i = n.div(t),
    r = $("#sellamount");
  r.val(i.toFixed(8))
});
$("#buyamount, #buyprice, #sellamount, #sellprice").on("keyup change", function() {
  truncateInputDecimals($(this), 8);
  calculateFee(!0)
});
$("#buyamount, #buyprice, #sellamount, #sellprice").on("blur", function() {
  truncateInputDecimals($(this), 0);
  calculateFee(!0)
});
$("#buynettotal, #sellnettotal").on("blur", function() {
  truncateInputDecimals($(this), 0);
  calculateFee(!1)
});
$("#buynettotal").on("keyup paste change", function() {
  var n = new Decimal($(this).val()),
    t = new Decimal($("#buyprice").val());
  if (n.greaterThan(0) && t.greaterThan(0)) {
    var i = new Decimal(.2).div(100).plus(1),
      r = n.div(i),
      u = r.div(t);
    $("#buyamount").val(u.toFixed(8));
    calculateFee(!1)
  }
});
$("#sellnettotal").on("keyup paste change", function() {
  var n = new Decimal($(this).val()),
    t = new Decimal($("#sellprice").val());
  if (n.greaterThan(0) && t.greaterThan(0)) {
    var i = new Decimal(99.8).div(100),
      r = n.div(i),
      u = r.div(t);
    $("#sellamount").val(u.toFixed(8));
    calculateFee(!1)
  }
});
$("#buyorders").on("click", "tr", function() {
  var u = $(this),
    n = u.find("td:nth-child(2)").text(),
    t = 0,
    i, r;
  $("#buyorders > tbody  > tr").each(function() {
    var i = $(this),
      r = +i.find("td:nth-child(2)").text();
    r >= n && (t += +i.find("td:nth-child(3)").text())
  });
  i = new Decimal(t);
  r = new Decimal(n);
  $("#buyprice, #sellprice").val(r.toFixed(8));
  $("#buyamount, #sellamount").val(i.toFixed(8));
  calculateFee(!0)
});
$("#sellorders").on("click", "tr", function() {
  var u = $(this),
    n = u.find("td:nth-child(2)").text(),
    t = 0,
    i, r;
  $("#sellorders > tbody  > tr").each(function() {
    var i = $(this),
      r = +i.find("td:nth-child(2)").text();
    r <= n && (t += +i.find("td:nth-child(3)").text())
  });
  i = new Decimal(t);
  r = new Decimal(n);
  $("#buyprice, #sellprice").val(r.toFixed(8));
  $("#buyamount, #sellamount").val(i.toFixed(8));
  calculateFee(!0)
});
$("#userBalanceBuy").on("click", function() {
  var n = new Decimal($(this).text()),
    t = new Decimal($("#buyprice").val());
  if (t.greaterThan(0) && n.greaterThan(0)) {
    var i = new Decimal(.2).div(100).plus(1),
      r = n.div(i),
      u = r.div(t);
    $("#buyamount").val(u.toFixed(8));
    calculateFee(!0)
  }
});
$("#userBalanceSell").on("click", function() {
  var n = new Decimal($(this).text()),
    t = new Decimal($("#sellprice").val());
  t.greaterThan(0) && n.greaterThan(0) && ($("#sellamount").val(n.toFixed(8)), calculateFee(!0))
});
$("#sell-first-amount").on("click", function() {
  var n = $("#buyorders > tbody > tr:first > td:nth-child(3)").text();
  n && $("#sellamount, #buyamount").val(n).trigger("change")
});
$("#sell-first-price").on("click", function() {
  var n = $("#buyorders > tbody > tr:first > td:nth-child(2)").text();
  n && $("#sellprice, #buyprice").val(n).trigger("change")
});
$("#sell-total-amount").on("click", function() {
  var n = $("#buyorders > tbody > tr:first > td:nth-child(2)").text();
  n && ($("#sellprice").val(n), $("#userBalanceSell").trigger("click"))
});
$("#buy-first-amount").on("click", function() {
  var n = $("#sellorders > tbody > tr:first > td:nth-child(3)").text();
  n && $("#buyamount, #sellamount").val(n).trigger("change")
});
$("#buy-first-price").on("click", function() {
  var n = $("#sellorders > tbody > tr:first > td:nth-child(2)").text();
  n && $("#buyprice, #sellprice").val(n).trigger("change")
});
$("#buy-total-amount").on("click", function() {
  var n = $("#sellorders > tbody > tr:first > td:nth-child(2)").text();
  n && ($("#buyprice").val(n), $("#userBalanceBuy").trigger("click"))
});
$(".chart-option-chart").on("click", function() {
  selectedChart = "trade";
  $(".chart-option-btn").removeClass("active");
  $("#chart-orderbook, #chart-distribution, .chart-options-dropdown").hide();
  $("#chart-trade, .chart-options-dropdown-trade").show();
  $(this).addClass("active");
  updateTradeChart()
});
$(".chart-option-orderbook").on("click", function() {
  selectedChart = "orderbook";
  $(".chart-option-btn").removeClass("active");
  $("#chart-trade, #chart-distribution, .chart-options-dropdown").hide();
  $("#chart-orderbook, .chart-options-dropdown-orderbook").show();
  $(this).addClass("active");
  updateOrderBookChart()
});
$(".chart-option-distribution").on("click", function() {
  selectedChart = "distribution";
  $(".chart-option-btn").removeClass("active");
  $("#chart-orderbook, #chart-trade, .chart-options-dropdown").hide();
  $("#chart-distribution, .chart-options-dropdown-distribution").show();
  $(this).addClass("active");
  updateDistributionChart()
});
$('[name="chart-orderbook-options"]').on("click", function() {
  var n = $(this).val();
  orderBookChartPercent = n;
  updateOrderBookChart()
});
$('[name="chart-distribution-options"]').on("click", function() {
  distributionChartCount = $(this).val();
  updateDistributionChart()
});
$("#chart-options").on("click", ".chart-options-dropdown-trade .chart-extras", function() {
  var i = $(this),
    t = i.closest(".chart-extras-container"),
    r = t.data("series"),
    u = t.find(".chart-extras-update"),
    n = t.find(".chart-extras-value"),
    f = n.val() > 0 ? n.val() : 1,
    e = i.is(":checked");
  if (e) {
    n.removeAttr("disabled");
    u.removeAttr("disabled");
    toggleSeries(r, f, !0);
    return
  }
  n.attr("disabled", "disabled");
  u.attr("disabled", "disabled");
  toggleSeries(r, f, !1)
});
$("#chart-options").on("click", ".chart-options-dropdown-trade  .chart-extras-update", function() {
  var i = $(this),
    n = i.closest(".chart-extras-container"),
    r = n.data("series"),
    t = n.find(".chart-extras-value"),
    u = t.val() > 0 ? t.val() : 1;
  toggleSeries(r, u, !0)
});
$("#chart-options").on("click", ".chart-options-save", function() {
  saveChartSettings()
});
$(".chart-range-group").on("click", ".btn-default", function() {
  var n = $(this).data("range");
  $(".chart-range-group > .btn-default").removeClass("active");
  $(this).addClass("active");
  updateSeriesRange(n)
});
$(".chart-candles-group").on("click", ".btn-default", function() {
  var n = $(this).data("candles");
  $(".chart-candles-group > .btn-default").removeClass("active");
  $(this).addClass("active");
  updateChartData(selectedSeriesRange, n)
});
$("#chartdata").mousemove(drawHorizontalCrosshair);
$(".chart-container").height(fullChart ? 565 : 365);
$("#chart-extras-candlestick")[0].checked = candlestickChart;
$("#chart-extras-candlestick").parent().find("label > .fa-circle").css({
  color: candlestickChartUpColor
});
$("#chart-extras-stockprice")[0].checked = stockPriceChart;
$("#chart-extras-stockprice").parent().find("label > .fa-circle").css({
  color: stockPriceChartColor
});
$("#chart-extras-volume")[0].checked = volumeChart;
$("#chart-extras-volume").parent().find("label > .fa-circle").css({
  color: volumeChartColor
});
$("#chart-extras-macd")[0].checked = macdChart;
$("#chart-extras-macd").parent().find("label > .fa-circle").css({
  color: macdChartColor
});
$("#chart-extras-signal")[0].checked = signalChart;
$("#chart-extras-signal").parent().find("label > .fa-circle").css({
  color: signalChartColor
});
$("#chart-extras-histogram")[0].checked = histogramChart;
$("#chart-extras-histogram").parent().find("label > .fa-circle").css({
  color: histogramChartUpColor
});
$("#chart-extras-fibonacci")[0].checked = fibonacciChart;
$("#chart-extras-fibonacci").parent().find("label > .fa-circle").css({
  color: fibonacciChartColor
});
$("#chart-extras-sma")[0].checked = smaChart;
$("#chart-extras-sma-value").val(smaChartValue);
$("#chart-extras-sma-value")[0].disabled = !smaChart;
$("#chart-extras-sma").parent().find("label > .fa-circle").css({
  color: smaChartColor
});
$("#chart-extras-ema1")[0].checked = ema1Chart;
$("#chart-extras-ema1-value").val(ema1ChartValue);
$("#chart-extras-ema1-value")[0].disabled = !ema1Chart;
$("#chart-extras-ema1").parent().find("label > .fa-circle").css({
  color: ema1ChartColor
});
$("#chart-extras-ema2")[0].checked = ema2Chart;
$("#chart-extras-ema2-value").val(ema2ChartValue);
$("#chart-extras-ema2-value")[0].disabled = !ema2Chart;
$("#chart-extras-ema2").parent().find("label > .fa-circle").css({
  color: ema2ChartColor
});
$('.chart-options-dropdown-orderbook [value="' + orderBookChartPercent + '"]')[0].checked = !0;
$('.chart-options-dropdown-distribution [value="' + distributionChartCount + '"]')[0].checked = !0;
candlestickChart && $(".chart-candlestick-item").show();
volumeChart && $(".chart-volume-item").show();
stockPriceChart && $(".chart-stockprice-item").show();
histogramChart && $(".chart-histogram-item").show();
fibonacciChart && $(".chart-fibonacci-item").show();
macdChart && $(".chart-macd-item").show();
signalChart && $(".chart-signal-item").show();
smaChart && $(".chart-sma-item").show();
ema1Chart && $(".chart-ema1-item").show();
ema2Chart && $(".chart-ema2-item").show();