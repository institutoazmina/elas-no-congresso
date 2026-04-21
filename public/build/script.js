function loadSelects(){
  var x, i, j, selElmnt, a, b, c;
  /* Look for any elements with the class "custom-select": */
  x = document.getElementsByClassName("custom-select");
  for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    /* For each element, create a new DIV that will act as the selected item: */
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /* For each element, create a new DIV that will contain the option list: */
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 0; j < selElmnt.length; j++) {
      /* For each option in the original select element,
      create a new DIV that will act as an option item: */
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.setAttribute("value", selElmnt.options[j].value);
      c.addEventListener("click", function(e) {
          /* When an item is clicked, update the original select box,
          and the selected item: */
          var y, i, k, s, h;
          s = this.parentNode.parentNode.getElementsByTagName("select")[0];
          h = this.parentNode.previousSibling;
          for (i = 0; i < s.length; i++) {
            if (s.options[i].innerHTML == this.innerHTML) {
              s.selectedIndex = i;
              h.innerHTML = this.innerHTML;
              y = this.parentNode.getElementsByClassName("same-as-selected");
              for (k = 0; k < y.length; k++) {
                y[k].removeAttribute("class");
              }
              this.setAttribute("class", "same-as-selected");
              break;
            }
          }
          h.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
      /* When the select box is clicked, close any other select boxes,
      and open/close the current select box: */
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");

      if(this.previousElementSibling.value != ''){
        this.classList.add('ativo');
      }else{
        this.classList.remove('ativo');
      }
      if(this.classList.contains('select-arrow-active') == false){
        this.previousElementSibling.dispatchEvent(new Event('change'));
      }
    });
  }
}
loadSelects();

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (i = 0; i < y.length; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);// Vars
var api = "/data/";
(graficoPrincipal = document.getElementById("graficoPrincipal")),
  (paginaRanking = document.getElementById("paginaRanking"));
rankingPropostas = document.getElementById("rankingPropostas");

var legislaturas = [],
  legislatura = false;

// Functions
var regioes = {
  AM: "Norte",
  RR: "Norte",
  AP: "Norte",
  PA: "Norte",
  TO: "Norte",
  RO: "Norte",
  AC: "Norte",
  MA: "Nordeste",
  PI: "Nordeste",
  CE: "Nordeste",
  RN: "Nordeste",
  PE: "Nordeste",
  PB: "Nordeste",
  SE: "Nordeste",
  AL: "Nordeste",
  BA: "Nordeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  GO: "Centro-Oeste",
  DF: "Centro-Oeste",
  SP: "Sudeste",
  RJ: "Sudeste",
  ES: "Sudeste",
  MG: "Sudeste",
  PR: "Sul",
  RS: "Sul",
  SC: "Sul",
};
var estados = {
  AM: "Amazonas",
  RR: "Roraima",
  AP: "Amapá",
  PA: "Pará",
  TO: "Tocantins",
  RO: "Roraima",
  AC: "Acre",
  MA: "Maranhão",
  PI: "Piauí",
  CE: "Ceará",
  RN: "Rio Grande do Norte",
  PE: "Pernambuco",
  PB: "Paraíba",
  SE: "Sergipe",
  AL: "Alagoas",
  BA: "Bahia",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  GO: "Goiás",
  DF: "Distrito Federal",
  SP: "São Paulo",
  RJ: "Rio de Janeiro",
  ES: "Espírito Santo",
  MG: "Minas Gerais",
  PR: "Paraná",
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
};
var generoLabel = { M: "Masculina", F: "Feminina" };

function cleanName(s) {
  if (!s) return s;
  s = s.toLowerCase();
  s = s.replace(/[ÁÀÂÃ]+/gi, "a");
  s = s.replace(/[ÉÈÊ]+/gi, "e");
  s = s.replace(/[ÍÌÎ]+/gi, "i");
  s = s.replace(/[ÓÒÔÕ]+/gi, "o");
  s = s.replace(/[ÚÙÛ]+/gi, "u");
  s = s.replace(/[Ç]+/gi, "c");
  s = s.replace(/[Ñ]+/gi, "n");
  s = s.replace("'", "_");
  s = s.replace(/[^A-Za-z\s\-\_]+/gi, "");
  s = s.replace(/\s+/gi, "_");
  s = s.replace(/-+/gi, "-");
  return s;
}

function cleanNameNum(s) {
  if (!s) return s;
  s = s.toLowerCase();
  s = s.replace(/[ÁÀÂÃ]+/gi, "a");
  s = s.replace(/[ÉÈÊ]+/gi, "e");
  s = s.replace(/[ÍÌÎ]+/gi, "i");
  s = s.replace(/[ÓÒÔÕ]+/gi, "o");
  s = s.replace(/[ÚÙÛ]+/gi, "u");
  s = s.replace(/[Ç]+/gi, "c");
  s = s.replace(/[Ñ]+/gi, "n");
  s = s.replace("'", "_");
  s = s.replace(/[^A-Za-z0-9\s\-\_]+/gi, "");
  s = s.replace(/\s+/gi, "_");
  s = s.replace(/-+/gi, "-");
  return s;
}

function stringMenos(m) {
  switch (m) {
    case "parlamentares":
      return "<b>Menos</b> parlamentares";
      break;
    case "media":
      return "<b>Menor</b> média";
      break;
    case "pctmulheres":
      return "<b>Menor</b> % de mulheres";
      break;
    default:
      return m;
  }
}
function stringMais(m) {
  switch (m) {
    case "parlamentares":
      return "<b>Mais</b> parlamentares";
      break;
    case "media":
      return "<b>Maior</b> média";
      break;
    case "pctmulheres":
      return "<b>Maior</b> % de mulheres";
      break;
    default:
      return m;
  }
}
function casa(s) {
  switch (s) {
    case "Senador":
      return "Senado";
      break;
    case "Deputado":
      return "Câmara";
      break;
    case "Senador fora de exercício":
      return "Senado";
      break;
    case "Deputado fora de exercício":
      return "Câmara";
      break;
    default:
      return s;
  }
}
function artigoCasa(s) {
  switch (s) {
    case "Senador":
      return "o";
      break;
    case "Deputado":
      return "a";
      break;
    case "Senador fora de exercício":
      return "o";
      break;
    case "Deputado fora de exercício":
      return "a";
      break;
    default:
      return s;
  }
}
function genero(s, g) {
  switch (s) {
    case "Campeão":
      return g == "F" ? "Campeã" : s;
      break;
    case "Deputado":
      return g == "F" ? "Deputada" : s;
      break;
    case "Senador":
      return g == "F" ? "Senadora" : s;
      break;
    case "Candidato":
      return g == "F" ? "Candidata" : s;
      break;
    case "Deputado fora de exercício":
      return g == "F" ? "Deputada fora de exercício" : s;
      break;
    case "Senador fora de exercício":
      return g == "F" ? "Senadora fora de exercício" : s;
      break;
    case "º":
      return g == "F" ? "ª" : s;
      break;
    default:
      return s;
  }
}
function favoravel(s) {
  switch (String(s)) {
    case "1":
      return "Favorável";
      break;
    case "-1":
      return "Desfavorável";
      break;
    default:
      return "";
  }
}
function relevancia(s) {
  switch (String(s)) {
    case "1":
      return "Pouca";
      break;
    case "2":
      return "Muita";
      break;
    default:
      return "";
  }
}

function copyToClipboard(str) {
  var el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  alert("Link copiado!");
}

/* Tooltip */
var tooltip = document.getElementById("tooltip");
function positionTooltip(e) {
  var w = tooltip.offsetWidth,
    ml = -w / 2,
    h = tooltip.offsetHeight,
    x = e.clientX,
    y = e.clientY,
    top = y - h - 30,
    left = Math.max(w / 2 + 30, Math.min(window.innerWidth - (w / 2 + 30), x));

  if (y <= 450) {
    top = y - 30;
    left = x < window.innerWidth / 2 ? x + 30 : x - w - 30;
    ml = 0;
  }

  tooltip.style.marginLeft = ml + "px";
  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
}
function positionRetoTooltip(e) {
  var w = tooltip.offsetWidth,
    ml = -w / 2,
    h = tooltip.offsetHeight,
    x = e.clientX,
    y = e.clientY,
    top = y - h - 30,
    left = Math.max(w / 2 + 30, Math.min(window.innerWidth - (w / 2 + 30), x));

  tooltip.style.marginLeft = ml + "px";
  tooltip.style.left = left + "px";
  tooltip.style.top = top + "px";
}

/* Tip Grafico */
var tip = document.getElementById("tipGrafico");

// App
var app = {
  cargo: "Deputado",
  grupo: "partido",
  ordem: "media",
  nome: false,
  candidato: false,
  genero: false,
  partido: false,
  regiao: false,
  estado: false,
  dados: false,
  temp: false,
  tempfiltrado: false,
  tempagrupado: false,
  svg: false,
  mediaGrupo: [],
  max: 0,
  min: 0,
  ddd: [],
  simulation: false,
  iniciar: function () {
    var preloader = graficoPrincipal.querySelector(".preloader");
    if (preloader) {
      preloader.style.opacity = 0;
      setTimeout(function () {
        preloader.remove();
      }, 500);
    }
    this.svg = graficoPrincipal.querySelector("svg");
    d3.json(api + "dados.json").then(function (d) {
      app.dados = d;
      legislaturas = Object.keys(app.dados.legislaturas);
      legislatura = legislaturas[legislaturas.length - 1];
      app.filtrar();
    });
  },
  filtrar: function () {
    this.max = this.min = 0;
    this.temp = Object.values(this.dados.legislaturas[legislatura].parlamentares);
    this.temp = this.temp
      .filter(function (a) {
        return a["cargo"].indexOf(app.cargo) != -1;
      })
      .map(function (a) {
        a.regiao = regioes[a.estado];
        if (a.valor > app.max) app.max = a.valor;
        if (a.valor < app.min) app.min = a.valor;
        return a;
      });

    this.montar();
  },
  montar: function () {
    Array.prototype.forEach.call(document.getElementsByClassName("select--geral"), function (a) {
      a.classList.remove("inativo");
    });
    Array.prototype.forEach.call(document.getElementsByClassName("select--" + this.grupo), function (a) {
      var s = a.querySelector(".select-items > div:first-child");
      if (s) s.click();
      var at = a.querySelector(".ativo");
      if (at) at.classList.remove("ativo");
      a.classList.add("inativo");
      app[app.grupo] = false;
    });

    this.tempfiltrado = this.temp.filter(function (a) {
      return 1;
    });
    //if(this.candidato) this.tempfiltrado = this.tempfiltrado.filter(function(a){ return (app.candidato != 'sim' && a['candidato'] != 'sim' ) || (app.candidato == 'sim' && a['candidato'] == app.candidato);});
    if (this.genero)
      this.tempfiltrado = this.tempfiltrado.filter(function (a) {
        return a["genero"] == app.genero;
      });
    if (this.partido)
      this.tempfiltrado = this.tempfiltrado.filter(function (a) {
        return a["partido"] == app.partido;
      });
    if (this.regiao)
      this.tempfiltrado = this.tempfiltrado.filter(function (a) {
        return a["regiao"] == app.regiao;
      });
    if (this.estado)
      this.tempfiltrado = this.tempfiltrado.filter(function (a) {
        return a["estado"] == app.estado;
      });
    if (this.nome)
      this.tempfiltrado = this.tempfiltrado.filter(function (a) {
        return cleanName(a["nome"]).indexOf(cleanName(app.nome)) != -1;
      });
    this.tempfiltrado = this.tempfiltrado.map(function (a) {
      return a.numero;
    });

    var g = {};

    for (var i = 0; i < this.temp.length; i++) {
      var x = this.temp[i];

      if (this.grupo == "regiao") x.regiao = regioes[x.estado];
      if (!g[x[this.grupo]]) g[x[this.grupo]] = { mulheres: 0, valor: 0, parlamentares: 0 };
      g[x[this.grupo]].parlamentares++;
      if (x["genero"] == "F") g[x[this.grupo]].mulheres++;
      if (x.v) g[x[this.grupo]].valor += x.v;
      //if(Object.values(x["autorias"]).length) g[x[this.grupo]].valor += Object.values(x["autorias"]).reduce(function(t,a){return t+a;});
      // if(Object.values(x["votos"]).length) g[x[this.grupo]].valor += Object.values(x["votos"]).reduce(function(t,a){return t+a;});
    }

    this.tempagrupado = [];
    Object.entries(g).forEach(function (a) {
      var b = {
        grupo: a[0],
        mulheres: a[1].mulheres,
        valor: a[1].valor,
        parlamentares: a[1].parlamentares,
        media: a[1].valor / a[1].parlamentares,
        pctmulheres: a[1].mulheres / a[1].parlamentares,
      };
      app.tempagrupado.push(b);

      app.mediaGrupo[a[0]] = a[1].valor / a[1].parlamentares;
    });
    if (app.ordem == "regiao") {
      this.tempagrupado.sort(function (a, b) {
        return a[app.ordem] - b[app.ordem];
      });
    } else {
      this.tempagrupado.sort(function (a, b) {
        return a[app.ordem] - b[app.ordem];
      });
    }

    d3.select(window.innerWidth > 1000 ? "#leg_x_menos" : "#leg_x_mais").html(stringMenos(this.ordem));
    d3.select(window.innerWidth > 1000 ? "#leg_x_mais" : "#leg_x_menos").html(stringMais(this.ordem));

    this.render();
  },
  render: function () {
    var svg = d3.select(this.svg),
      pw = this.svg.parentNode.offsetWidth,
      ph = this.svg.parentNode.offsetHeight;

    svg
      .attr("viewbox", "0 0 " + pw + " " + ph)
      .attr("width", pw)
      .attr("height", ph);
    svg.select("*").remove();

    if (window.innerWidth > 1000) {
      var w = pw - 40,
        h = ph - 60;

      var xscale = d3
          .scaleBand()
          .rangeRound([0, w])
          .domain(
            this.tempagrupado.map(function (a) {
              return a.grupo;
            })
          )
          .paddingInner(1)
          .paddingOuter(0.5),
        yscale = d3
          .scaleLinear()
          .domain([-100, 100])
          .range([h / 2, -h / 2]);

      var g = svg.append("g").attr("transform", "translate(10,50)");

      var guias = g
        .append("g")
        .classed("guia", 1)
        .attr("transform", "translate(0," + h / 2 + ")");

      for (var i = -100; i <= 100; i += 20) {
        guias
          .append("line")
          .attr("x1", i == 0 ? -10 : 0)
          .attr("y1", yscale(i))
          .attr("x2", w)
          .attr("y2", yscale(i))
          .attr("class", "grid " + (i == 0 ? "zero" : ""));
        guias
          .append("text")
          .attr("y", yscale(i))
          .attr("x", w + 30)
          .text((i > 0 ? "+" : "") + i)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "end");
      }

      for (var i = 0; i < this.tempagrupado.length; i++) {
        var j = this.tempagrupado[i];
        guiaGrupo = guias.append("g").attr("class", "grupo").data([j.grupo]);
        guiaGrupo
          .append("line")
          .attr("x1", xscale(j.grupo))
          .attr("x2", xscale(j.grupo))
          .attr("y1", -h / 2)
          .attr("y2", h / 2)
          .attr("class", "grid");
        guiaGrupo
          .append("text")
          .attr("x", xscale(j.grupo))
          .attr("y", -(h / 2) - 10)
          .text(j.grupo.length > 8 ? j.grupo.slice(0, 7) + "." : j.grupo)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "start")
          .attr("transform", "rotate(-90," + xscale(j.grupo) + "," + (-(h / 2) - 10) + ")");
        guiaGrupo
          .append("rect")
          .attr("x", xscale(j.grupo) - 10)
          .attr("y", -h / 2)
          .attr("height", h)
          .attr("width", 20);

        mediaGrupo = guiaGrupo.append("g").attr("class", "media stec" + parseInt(this.mediaGrupo[j.grupo]));
        mediaGrupo
          .append("line")
          .attr("x1", xscale(j.grupo) - 10)
          .attr("x2", xscale(j.grupo) + 10)
          .attr("y1", yscale(this.mediaGrupo[j.grupo]))
          .attr("y2", yscale(this.mediaGrupo[j.grupo]))
          .attr("class", "media-linha");

        bandeirinha = mediaGrupo
          .append("svg")
          .attr("x", xscale(j.grupo) - 28)
          .attr("y", yscale(this.mediaGrupo[j.grupo]) - 5)
          .attr("width", 15)
          .attr("height", 12)
          .attr("viewBox", "0 0 14.8 11.2")
          .attr("class", "indicador stec" + parseInt(this.mediaGrupo[j.grupo]));
        bandeirinha.append("line").attr("x1", 0.5).attr("x2", 5).attr("y1", 10.7).attr("y2", 0.5);
        bandeirinha
          .append("path")
          .attr("d", "M7.1,2c1.5-1,3.5-1,4.5.5s1.9,1.2,3.5.5L12.6,8.5c-1,.3-2.1-.2-3.5-1.5s-2.8-1.2-4.5.5")
          .attr("transform", "translate(-0.8 -0.3)");
      }

      app.ddd = [];
      app.ddd = this.temp
        .filter(function (a) {
          return 1;
        })
        .map(function (a, i) {
          a.x = xscale(a[app.grupo]);
          a.y = yscale(a.valor == null ? 0 : a.v);
          return a;
        });

      if (app.simulation) {
        app.simulation.stop().nodes(app.ddd).alpha(0.5);
      }
      app.simulation = d3
        .forceSimulation()
        .nodes(app.ddd)
        .force(
          "x",
          d3.forceX(function (d) {
            return xscale(d[app.grupo]);
          })
        )
        .force(
          "y",
          d3.forceY(function (d) {
            return yscale(d.valor == null ? 0 : d.v);
          })
        )
        .force("collision", d3.forceCollide(4))
        .on("tick", function () {
          bolinhas
            .attr("cx", function (d) {
              return d.x;
            })
            .attr("cy", function (d) {
              return d.y;
            });
        });

      var bolinhasg = g
        .append("g")
        .classed("bolinhas", 1)
        .attr("transform", "translate(0," + h / 2 + ")");
      var bolinhas = bolinhasg
        .selectAll(".bolinha")
        .remove()
        .data(app.ddd)
        .enter()
        .append("circle")
        .attr("class", function (d) {
          return "bolinha bgec" + (d.valor == null ? "null" : d.v);
        })
        .attr("r", 4)
        .attr("cx", function (d) {
          return xscale(d[app.grupo]);
        })
        .attr("cy", function (d) {
          return yscale(d.valor == null ? 0 : d.v);
        })
        .style("opacity", function (d) {
          return app.tempfiltrado.indexOf(d.numero) != -1 ? 1 : 0.2;
        });
    } else {
      var w = pw - 60,
        h = ph - 60;

      var yscale = d3
          .scaleBand()
          .rangeRound([h, 0])
          .domain(
            this.tempagrupado.map(function (a) {
              return a.grupo;
            })
          )
          .paddingInner(1)
          .paddingOuter(0.5),
        xscale = d3
          .scaleLinear()
          .domain([-100, 100])
          .range([-w / 2, w / 2]);

      var g = svg.append("g").attr("transform", "translate(55,5)");

      var guias = g
        .append("g")
        .classed("guia", 1)
        .attr("transform", "translate(" + w / 2 + ",0)");

      for (var i = -100; i <= 100; i += 20) {
        guias
          .append("line")
          .attr("x1", xscale(i))
          .attr("y2", h)
          .attr("x2", xscale(i))
          .attr("class", "grid " + (i == 0 ? "zero" : ""));
        guias
          .append("text")
          .attr("x", xscale(i))
          .attr("y", h + 20)
          .text((i > 0 ? "+" : "") + i)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90," + xscale(i) + "," + (h + 20) + ")");
      }

      for (var i = 0; i < this.tempagrupado.length; i++) {
        var j = this.tempagrupado[i];
        guiaGrupo = guias.append("g").attr("class", "grupo").data([j.grupo]);
        guiaGrupo
          .append("rect")
          .attr("x", -w / 2)
          .attr("y", yscale(j.grupo) - 10)
          .attr("height", 20)
          .attr("width", w)
          .attr("fill", "transparent");
        guiaGrupo
          .append("line")
          .attr("y1", yscale(j.grupo))
          .attr("y2", yscale(j.grupo))
          .attr("x1", -w / 2)
          .attr("x2", w / 2)
          .attr("class", "grid");
        guiaGrupo
          .append("text")
          .attr("y", yscale(j.grupo))
          .attr("x", -(w / 2) - 10)
          .text(j.grupo.length > 5 ? j.grupo.slice(0, 5) + "." : j.grupo)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "end");
        guiaGrupo
          .append("rect")
          .attr("y", yscale(j.grupo) - 10)
          .attr("x", -w / 2)
          .attr("height", 20)
          .attr("width", w);

        mediaGrupo = guiaGrupo.append("g").attr("class", "media stec" + parseInt(this.mediaGrupo[j.grupo]));
        mediaGrupo
          .append("line")
          .attr("x1", xscale(this.mediaGrupo[j.grupo]))
          .attr("x2", xscale(this.mediaGrupo[j.grupo]))
          .attr("y1", yscale(j.grupo) - 10)
          .attr("y2", yscale(j.grupo) + 10)
          .attr("class", "media-linha");

        bandeirinha = mediaGrupo
          .append("svg")
          .attr("y", yscale(j.grupo) - 22)
          .attr("x", xscale(this.mediaGrupo[j.grupo]) - 5)
          .attr("width", 15)
          .attr("height", 12)
          .attr("viewBox", "0 0 14.8 11.2")
          .attr("class", "indicador stec" + parseInt(this.mediaGrupo[j.grupo]));
        bandeirinha.append("line").attr("x1", 0.5).attr("x2", 5).attr("y1", 10.7).attr("y2", 0.5);
        bandeirinha
          .append("path")
          .attr("d", "M7.1,2c1.5-1,3.5-1,4.5.5s1.9,1.2,3.5.5L12.6,8.5c-1,.3-2.1-.2-3.5-1.5s-2.8-1.2-4.5.5")
          .attr("transform", "translate(-0.8 -0.3)");
      }

      app.ddd = [];
      app.ddd = this.temp
        .filter(function (a) {
          return 1;
        })
        .map(function (a, i) {
          a.x = xscale(a[app.grupo]);
          a.y = yscale(a.valor == null ? 0 : a.v);
          return a;
          //console.log(a);
        });

      if (app.simulation) {
        app.simulation.stop().nodes(app.ddd).alpha(0.5);
      }
      app.simulation = d3
        .forceSimulation()
        .nodes(app.ddd)
        .force(
          "y",
          d3
            .forceY(function (d) {
              return yscale(d[app.grupo]);
            })
            .strength(0.9)
        )
        .force(
          "x",
          d3
            .forceX(function (d) {
              return xscale(d.valor == null ? 0 : d.v);
            })
            .strength(1)
        )
        .force("collision", d3.forceCollide(4))
        .on("tick", function () {
          bolinhas
            .attr("cx", function (d) {
              return d.x;
            })
            .attr("cy", function (d) {
              return d.y;
            });
        });

      var bolinhasg = g
        .append("g")
        .classed("bolinhas", 1)
        .attr("transform", "translate(" + w / 2 + ",0)");
      var bolinhas = bolinhasg
        .selectAll(".bolinha")
        .remove()
        .data(app.ddd)
        .enter()
        .append("circle")
        .attr("class", function (d) {
          return "bolinha bgec" + (d.valor == null ? "null" : d.v);
        })
        .attr("r", 4)
        .style("opacity", function (d) {
          return app.tempfiltrado.indexOf(d.numero) != -1 ? 1 : 0.2;
        })
        .attr("cy", function (d) {
          return yscale(d[app.grupo]);
        })
        .attr("cx", function (d) {
          return xscale(d.v);
        });
    }

    guias
      .selectAll(".grupo")
      .on("mouseenter", function (d, e) {
        var o =
          '<p class="t1 tcb w100 uc m0 tc">Média</p><p class="t1 tcb w800 uc m0 tc lh1-50 ls01">' +
          (app.grupo == "estado" ? estados[d] : app.grupo == "genero" ? generoLabel[d] : d) +
          '</p><div class="flex center-xs middle-xs"><svg class="indicador stec' +
          parseInt(app.mediaGrupo[d]) +
          '" viewBox="0 0 14.8 11.2"><line x1="0.5" y1="10.7" x2="5" y2="0.5"/><path d="M7.1,2c1.5-1,3.5-1,4.5.5s1.9,1.2,3.5.5L12.6,8.5c-1,.3-2.1-.2-3.5-1.5s-2.8-1.2-4.5.5" transform="translate(-0.8 -0.3)"/></svg><p class="ff1 t2 w600 ls01 m0 ml05 tcec' +
          parseInt(app.mediaGrupo[d]) +
          '">' +
          (app.mediaGrupo[d] > 0 ? "+" : "") +
          app.mediaGrupo[d].toLocaleString("pt-BR", { maximumFractionDigits: 2 }) +
          "</p></div>";
        tip.innerHTML = o;
        tip.className = "ativo";
        if (window.innerWidth > 1000) {
          tip.style.left = this.getBoundingClientRect().left - this.parentNode.getBoundingClientRect().left + 28 + "px";
          tip.style.top = "0";
        } else {
          tip.style.top = this.getBoundingClientRect().top - this.parentNode.getBoundingClientRect().top + "px";
          tip.style.left = "3px";
        }
      })
      .on("mouseleave", function (d) {
        tip.className = "";
      });

    bolinhas
      .on("mouseenter", function (d, e) {
        var v = d.valor == null ? null : d.v;
        var o = '<div class="bga tcb flex p1 pt3 pb2 jcsa comrasgob">';
        if (d.valor != null)
          o +=
            '<div class="nivel-simples">' +
            '<div class="grid">' +
            '<span class="zero">0</span>' +
            (v != null
              ? '<div class="barra ' +
                (v < 0 ? "negativa" : "positiva") +
                '" style="height: ' +
                (v < 0 ? -v : v) / 2 +
                "%; height: calc(" +
                (v < 0 ? -v : v) / 2 +
                '% - 7px);"></div>'
              : "") +
            '<div class="nota"><div style="bottom: ' +
            v +
            '%"><span class="bgec' +
            v +
            '"></span><p class="tcec' +
            v +
            '">' +
            (v > 0 ? "+" + v : v) +
            "</p></div></div>" +
            "</div>" +
            "</div>";
        o += '<div class="resumo-parlamentar">';

        if (d.pos_ranking && d.pos_ranking == 1 && d.valor > 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            " d" +
            artigoCasa(d.cargo) +
            " " +
            casa(d.cargo) +
            '</p><p>de Propostas<br>favoráveis</p></span><div class="icone favoravel"></div></div>';
        } else if (d.pos_partido && d.pos_partido == 1 && d.valor > 0 && app.grupo == "partido") {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Partido</p><p>de Propostas<br>favoráveis</p></span><div class="icone favoravel"></div></div>';
        } else if (d.pos_estado && d.pos_estado == 1 && d.valor > 0 && app.grupo == "estado") {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Estado</p><p>de Propostas<br>favoráveis</p></span><div class="icone favoravel"></div></div>';
        } else if (d.ult_ranking && d.ult_ranking == 1 && d.valor < 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            " d" +
            artigoCasa(d.cargo) +
            " " +
            casa(d.cargo) +
            '</p><p>de Propostas<br>desfavoráveis</p></span><div class="icone desfavoravel"></div></div>';
        } else if (d.ult_partido && d.ult_partido == 1 && d.valor < 0 && app.grupo == "partido") {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Partido</p><p>de Propostas<br>desfavoráveis</p></span><div class="icone desfavoravel"></div></div>';
        } else if (d.ult_estado && d.ult_estado == 1 && d.valor < 0 && app.grupo == "estado") {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Estado</p><p>de Propostas<br>desfavoráveis</p></span><div class="icone desfavoravel"></div></div>';
        } /* else if(d.valor){
					        o+='<div class="tag"><span><p>'+genero(d.cargo,d.genero)+' com</p><p>Propostas<br>'+(d.valor>0 ? "favoráveis" : "desfavoráveis")+'</p></span><div class="icone '+(d.valor>0 ? "favoravel" : "desfavoravel")+'"></div></div>';
					    }*/

        o += '<div class="thumbnail bgec' + v + '"><img src="' + d.foto + '" alt="Foto de ' + d.nome + ' (' + d.partido + '-' + d.estado + ')" title="' + d.nome + ' (' + d.partido + '-' + d.estado + ')"></div>';

        //o+=(d.candidato_cargo ? '<div class="candidato"><div class="icone urna"></div><span><p>'+genero('Candidato',d.genero)+' a</p><p>'+d.candidato_cargo+'</p></span></div>' : '');

        o +=
          "</div>" +
          "</div>" +
          '<div class="p1 pt0 tca">' +
          '<div class="t2 ff1 uc w400 wdth400">' +
          genero(d.cargo, d.genero) +
          "</div>" +
          '<div class="t5 ff1 uc lh1 w900 wdth200">' +
          d.nome +
          "</div>" +
          '<div class="t3 ff1 uc w300 mb05 wdth300">' +
          d.partido +
          " - " +
          d.estado +
          "</div>" +
          (d.pos_ranking
            ? '<div class="t3 ff1 w300 mb05 wdth300"><span class="w700 splash"><span class="bgec' +
              v +
              '"></span>' +
              d.pos_ranking +
              genero("º", d.genero) +
              "</span> no ranking</div>"
            : "") +
          // +'<div class="t2 uc w300 wdth300"><span class="ff1 w600 wdth300">'+Object.keys(d.autorias).length+'</span> propostas <span class="ml1 ff1 w600 wdth300">'+Object.keys(d.votos).length+'</span> votações</div>'
          '<div class="t2 uc w300 wdth300"><span class="ff1 w600 wdth300">' +
          Object.keys(d.autorias).length +
          "</span> propostas</div>" +
          "</div>";
        tooltip.innerHTML = o;
        tooltip.className = "ativo";
        positionTooltip(event);
      })
      .on("mouseleave", function (d) {
        tooltip.className = "";
      })
      .on("click", function (d) {
        window.location = home_url + "perfil/" + d.slug;
      });
  },
  clearFiltros: function () {
    app.genero = app.partido = app.regiao = app.estado = false;
    Array.prototype.forEach.call(
      document.querySelectorAll(".select--geral .select-items > div:first-child"),
      function (a) {
        a.click();
      }
    );
    app.filtrar();
  },
};

// Ranking
var rank = {
  cargo: "Deputado",
  ordem: "v",
  ordemdir: -1,
  nome: false,
  //candidato: false,
  genero: false,
  partido: false,
  regiao: false,
  estado: false,
  dados: false,
  temp: false,
  tempagrupado: false,
  max: 0,
  min: 0,
  page: 0,
  posts: 1000,
  iniciar: function () {
    var preloader = paginaRanking.querySelector(".preloader");
    if (preloader) {
      preloader.style.opacity = 0;
      setTimeout(function () {
        preloader.remove();
      }, 500);
    }
    d3.json("/dados.json").then(function (d) {
      rank.dados = d;
      legislaturas = Object.keys(d.legislaturas);
      legislatura = legislaturas[legislaturas.length - 1];
      rank.filtrar();
    });
  },
  filtrar: function () {
    this.max = this.min = 0;
    this.temp = Object.values(this.dados.legislaturas[legislatura].parlamentares);
    this.temp = this.temp
      .filter(function (a) {
        return a["cargo"].indexOf(rank.cargo) != -1;
      })
      .map(function (a) {
        a.regiao = regioes[a.estado];
        if (a.valor > rank.max) rank.max = a.valor;
        if (a.valor < rank.min) rank.min = a.valor;
        return a;
      });
    //if(this.candidato) this.temp = this.temp.filter(function(a){ return (rank.candidato != 'sim' && a['candidato'] != 'sim' ) || (rank.candidato == 'sim' && a['candidato'] == rank.candidato);});
    if (this.genero)
      this.temp = this.temp.filter(function (a) {
        return a["genero"] == rank.genero;
      });
    if (this.partido)
      this.temp = this.temp.filter(function (a) {
        return a["partido"] == rank.partido;
      });
    if (this.regiao)
      this.temp = this.temp.filter(function (a) {
        return a["regiao"] == rank.regiao;
      });
    if (this.estado)
      this.temp = this.temp.filter(function (a) {
        return a["estado"] == rank.estado;
      });

    if (this.nome)
      this.temp = this.temp.filter(function (a) {
        return cleanName(a["nome"]).indexOf(cleanName(rank.nome)) != -1;
      });

    this.montar();
  },
  montar: function () {
    /*if(rank.ordem == "regiao"){
				this.temp.sort(function(a,b){ return b[rank.ordem] - a[rank.ordem]; });
			}*/
    if (rank.ordem == "v" || rank.ordem == "pos_ranking") {
      this.temp.sort(function (a, b) {
        if (b.valor == a.valor) {
          if (a.nome < b.nome) {
            return rank.ordemdir * -1;
          }
          if (a.nome > b.nome) {
            return rank.ordemdir;
          }
          return 0;
        } else if (b.valor == null) {
          return -999;
        }
        return rank.ordemdir > 0 ? b.valor - a.valor : a.valor - b.valor;
      });
    } else if (rank.ordem == "autorias") {
      this.temp.sort(function (a, b) {
        if (Object.keys(a[rank.ordem]).length < Object.keys(b[rank.ordem]).length) {
          return rank.ordemdir;
        }
        if (Object.keys(a[rank.ordem]).length > Object.keys(b[rank.ordem]).length) {
          return rank.ordemdir * -1;
        }
        return 0;
      });
    } else {
      this.temp.sort(function (a, b) {
        if (a[rank.ordem] < b[rank.ordem]) {
          return rank.ordemdir * -1;
        }
        if (a[rank.ordem] > b[rank.ordem]) {
          return rank.ordemdir;
        }
        return 0;
      });
    }

    var o = "";
    if (window.innerWidth > 1000) {
      o +=
        '<section class="row"><div class="col-xs-12 col-md-10 col-md-offset-1"><div class="table-wrap"><table class="ranking"><thead><tr>' +
        '<th><label><input type="radio" name="ordenar" value="pos_ranking" onchange="if(rank.ordem==this.value){rank.ordemdir*=-1;}else{rank.ordem=this.value;rank.ordemdir=1;};rank.montar();" class="' +
        (this.ordem == "pos_ranking" ? "checked" : "") +
        " " +
        (this.ordemdir < 0 ? "decrescente" : "crescente") +
        '"><span>Ranking</span></label></th>' +
        '<th><label><input type="radio" name="ordenar" value="v" onchange="if(rank.ordem==this.value){rank.ordemdir*=-1;}else{rank.ordem=this.value;rank.ordemdir=1;};rank.montar();" class="' +
        (this.ordem == "v" ? "checked" : "") +
        " " +
        (this.ordemdir < 0 ? "decrescente" : "crescente") +
        '"><span>Nota</span></label></th>' +
        '<th><label><input type="radio" name="ordenar" value="slug" onchange="if(rank.ordem==this.value){rank.ordemdir*=-1;}else{rank.ordem=this.value;rank.ordemdir=1;};rank.montar();" class="' +
        (this.ordem == "slug" ? "checked" : "") +
        " " +
        (this.ordemdir < 0 ? "decrescente" : "crescente") +
        '"><span>' +
        this.cargo +
        "(a)</span></label></th>" +
        '<th><label><input type="radio" name="ordenar" value="partido" onchange="if(rank.ordem==this.value){rank.ordemdir*=-1;}else{rank.ordem=this.value;rank.ordemdir=1;};rank.montar();" class="' +
        (this.ordem == "partido" ? "checked" : "") +
        " " +
        (this.ordemdir < 0 ? "decrescente" : "crescente") +
        '"><span>Partido</span></label></th>' +
        '<th><label><input type="radio" name="ordenar" value="estado" onchange="if(rank.ordem==this.value){rank.ordemdir*=-1;}else{rank.ordem=this.value;rank.ordemdir=1;};rank.montar();" class="' +
        (this.ordem == "estado" ? "checked" : "") +
        " " +
        (this.ordemdir < 0 ? "decrescente" : "crescente") +
        '"><span>UF</span></label></th>' +
        //+'<th><label><span>Candidato 2022?</span></label></th>'
        '<th><label><input type="radio" name="ordenar" value="autorias" onchange="if(rank.ordem==this.value){rank.ordemdir*=-1;}else{rank.ordem=this.value;rank.ordemdir=1;};rank.montar();" class="' +
        (this.ordem == "autorias" ? "checked" : "") +
        " " +
        (this.ordemdir < 0 ? "decrescente" : "crescente") +
        '"><span>Autorias</span></label></th>' +
        // +'<th><label><input type="radio" name="ordenar" value="votos" onchange="if(rank.ordem==this.value){rank.ordemdir*=-1;}else{rank.ordem=this.value;rank.ordemdir=1;};rank.montar();" class="'+(this.ordem=="votos"?"checked":"")+' '+(this.ordemdir<0?"decrescente":"crescente")+'"><span>Votações</span></label></th>'
        '</tr></thead><tbody id="ranking"></tbody></table></div></div></section>';
      this.page = 0;
    } else {
      o += '<section class="row" id="ranking"></section>';
      this.page = 0;
    }

    o +=
      '<section class="row"><div class="col-xs-12 col-md-10 col-md-offset-1"><nav class="paginacao"><ul id="paginacaoAtiva"></ul></nav></div></section>';

    paginaRanking.innerHTML = o;

    this.render();
  },
  render: function () {
    var r = paginaRanking.querySelector("#ranking");
    var o = "";

    var pag = paginaRanking.querySelector("#paginacaoAtiva");
    var op = "";
    var ult = Math.floor(this.temp.length / this.posts);
    if (this.page > 2)
      op +=
        '<li><a onclick="rank.page=0;rank.render();" class="' +
        (0 == this.page ? "ativo" : "") +
        '">Primeiro</a></li><li><span>...</span></li>';
    for (var i = Math.max(0, this.page - 2); i <= Math.min(this.page + 2, ult); i++) {
      op +=
        '<li><a onclick="rank.page=' +
        i +
        ';rank.render();" class="' +
        (i == this.page ? "ativo" : "") +
        '">' +
        (i + 1) +
        "</a></li>";
    }
    if (this.page < ult - 2)
      op +=
        '<li><span>...</span></li><li><a onclick="rank.page=' +
        ult +
        ';rank.render();" class="' +
        (ult == this.page ? "ativo" : "") +
        '">Último</a></li>';
    pag.innerHTML = op;

    var inicial = this.page * this.posts;
    var final = (this.page + 1) * this.posts;
    if (window.innerWidth > 1000) {
      for (var i = inicial; i < Math.min(final, this.temp.length); i++) {
        var d = this.temp[i];
        o +=
          "<tr>" +
          '<td><span class="ranking">' +
          (d.valor != null ? d.pos_ranking : "--") +
          genero("º", d.genero) +
          "</span></td>" +
          '<td><a class="flex acenter" href="' +
          home_url +
          "perfil/" +
          d.slug +
          "?legislatura=" +
          legislatura +
          '"><span class="thumbnail bgec' +
          d.v +
          '"><img src="' +
          d.foto +
          '" alt="Foto de ' + d.nome + ' (' + d.partido + '-' + d.estado + ')" title="' + d.nome + ' (' + d.partido + '-' + d.estado + ')"></span><span class="nota tcec' +
          d.v +
          '">' +
          (d.valor != null ? d.v : "--") +
          "</span></a></td>" +
          '<td><a class="flex acenter" href="' +
          home_url +
          "perfil/" +
          d.slug +
          "?legislatura=" +
          legislatura +
          '"><span class="parlamentar">' +
          d.nome +
          "</span>" +
          (d.cargo.indexOf("fora") != -1
            ? '<div class="icone fora ml05 sombra-interativa"><span>' + genero(d.cargo, d.genero) + "</span></div>"
            : "") +
          "</a></td>" +
          '<td><span class="partido">' +
          d.partido +
          "</span></td>" +
          '<td><span class="estado">' +
          d.estado +
          "</span></td>" +
          //+'<td><span class="candidato">'+(d.candidato ? 'Sim' : 'Não')+'</span></td>'
          '<td><span class="autorias">' +
          Object.values(d.autorias).length +
          "</span></td>" +
          // +'<td><span class="votacoes">'+Object.values(d.votos).length+'</span></td>'
          "</tr>";
      }
      if (!o) {
        o +=
          '<p class="tcb">Nenhum ' +
          this.cargo.toLowerCase() +
          " encontrado para esses critérios. Tente alterar os filtros.</p>";
      }
    } else {
      for (var i = inicial; i < Math.min(final, this.temp.length); i++) {
        var d = this.temp[i];
        o +=
          '<div class="col-xs-12"><div class="compilado-parlamentar tcb">' +
          '<p class="titulo-variavel t4"><span class="w900 wdth350">' +
          (d.valor != null ? d.pos_ranking : "--") +
          genero("º", d.genero) +
          '</span><span class="w400 wdth200"> no </span><span class="w900 wdth350">ranking</span></p>' +
          '<div class="graficos extras bga tcb flex p1 pt3 pb2">';
        if (d.valor != null)
          o +=
            '<div class="nivel-simples">' +
            '<div class="grid">' +
            '<span class="zero">0</span>' +
            (d.v != null
              ? '<div class="barra ' +
                (d.v < 0 ? "negativa" : "positiva") +
                '" style="height: ' +
                (d.v < 0 ? -d.v : d.v) / 2 +
                "%; height: calc(" +
                (d.v < 0 ? -d.v : d.v) / 2 +
                '% - 7px);"></div>'
              : "") +
            '<div class="nota"><div style="bottom: ' +
            d.v +
            '%"><span class="bgec' +
            d.v +
            '"></span><p class="tcec' +
            d.v +
            '">' +
            (d.v > 0 ? "+" + d.v : d.v) +
            "</p></div></div>" +
            "</div>" +
            "</div>";
        o += '<div class="resumo-parlamentar">';
        if (d.pos_ranking && d.pos_ranking == 1 && d.valor > 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            " d" +
            artigoCasa(d.cargo) +
            " " +
            casa(d.cargo) +
            '</p><p>de Propostas<br>favoráveis</p></span><div class="icone favoravel"></div></div>';
        } else if (d.pos_partido && d.pos_partido == 1 && d.valor > 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Partido</p><p>de Propostas<br>favoráveis</p></span><div class="icone favoravel"></div></div>';
        } else if (d.pos_estado && d.pos_estado == 1 && d.valor > 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Estado</p><p>de Propostas<br>favoráveis</p></span><div class="icone favoravel"></div></div>';
        } else if (d.ult_ranking && d.ult_ranking == 1 && d.valor < 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            " d" +
            artigoCasa(d.cargo) +
            " " +
            casa(d.cargo) +
            '</p><p>de Propostas<br>desfavoráveis</p></span><div class="icone desfavoravel"></div></div>';
        } else if (d.ult_partido && d.ult_partido == 1 && d.valor < 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Partido</p><p>de Propostas<br>desfavoráveis</p></span><div class="icone desfavoravel"></div></div>';
        } else if (d.ult_estado && d.ult_estado == 1 && d.valor < 0) {
          o +=
            '<div class="tag"><span><p>' +
            genero("Campeão", d.genero) +
            ' do Estado</p><p>de Propostas<br>desfavoráveis</p></span><div class="icone desfavoravel"></div></div>';
        } else if (d.valor) {
          o +=
            '<div class="tag"><span><p>' +
            genero(d.cargo, d.genero) +
            " com</p><p>Propostas<br>" +
            (d.valor > 0 ? "favoráveis" : "desfavoráveis") +
            '</p></span><div class="icone ' +
            (d.valor > 0 ? "favoravel" : "desfavoravel") +
            '"></div></div>';
        }

        o += '<div class="thumbnail bgec' + d.v + '"><img src="' + d.foto + '" alt="Foto de ' + d.nome + ' (' + d.partido + '-' + d.estado + ')" title="' + d.nome + ' (' + d.partido + '-' + d.estado + ')"></div>';

        //o+=(d.candidato_cargo ? '<div class="candidato"><div class="icone urna"></div><span><p>'+genero('Candidato',d.genero)+' a</p><p>'+d.candidato_cargo+'</p></span></div>' : '');

        o +=
          "</div>" +
          "</div>" +
          '<div class="descricao">' +
          '<p class="t5 ff1 w900 wdth200 mb0">' +
          d.nome +
          "</p>" +
          '<p class="t4 ff1 w400 wdth350 mb05">' +
          d.partido +
          "-" +
          d.estado +
          "</p>" +
          '<div class="flex">' +
          '<p class="ff1 uc w300 wdth250 t1 mr1"><span class="w900 wdth350">' +
          Object.values(d.autorias).length +
          " </span> Propostas</p>" +
          // +'<p class="ff1 uc w300 wdth250 t1"><span class="w900 wdth350">'+Object.values(d.votos).length+' </span> Votações</p>'
          "</div>" +
          '<a href="' +
          home_url +
          "perfil/" +
          d.slug +
          "?legislatura=" +
          legislatura +
          '" class="link-ext t1">Ver perfil do deputado</a>' +
          "</div>" +
          "</div></div>";
      }
      if (!o) {
        o +=
          '<div class="col-xs-12 tcb"><p>Nenhum ' +
          this.cargo.toLowerCase() +
          " encontrado para esses critérios. Tente alterar os filtros.</p></div>";
      }
    }

    r.innerHTML = o;
  },
};

// Propostas
var props = {
  cargo: "Deputado",
  ordem: "numero",
  ordemdir: -1,
  numero: false,
  dados: false,
  temp: false,
  page: 0,
  posts: 15,
  iniciar: function () {
    var preloader = rankingPropostas.querySelector(".preloader");
    if (preloader) {
      preloader.style.opacity = 0;
      setTimeout(function () {
        preloader.remove();
      }, 500);
    }
    d3.json("/dados.json").then(function (d) {
      props.dados = d;
      legislaturas = Object.keys(d.legislaturas);
      legislatura = legislaturas[legislaturas.length - 1];
      props.filtrar();
    });
  },
  filtrar: function () {
    this.temp = Object.values(this.dados.legislaturas[legislatura].proposicoes);
    this.temp = this.temp.filter(function (a) {
      return a["casa"] == props.cargo;
    });

    // document.getElementById("npropostas").innerHTML = this.temp.length;

    if (this.numero) {
      this.temp = this.temp.filter(function (a) {
        if (
          cleanNameNum(a["numero"]).indexOf(cleanNameNum(props.numero)) != -1 ||
          cleanNameNum(a["resumo"]).indexOf(cleanNameNum(props.numero)) != -1
        ) {
          return a;
        }
      });
    }

    this.montar();
  },
  montar: function () {
    /*if(["numero","avaliador"].indexOf(props.ordem) != -1){
				this.temp = this.temp.sort(function(a,b){ return b[props.ordem] < a[props.ordem]; });
			}else{
				this.temp = this.temp.sort(function(a,b){ if(b[props.ordem] == a[props.ordem]){ if(a.slug < b.slug) { return -1; }if(a.slug > b.slug) { return 1; }return 0; } return b[props.ordem] - a[props.ordem]; });
			}*/

    if (props.ordem == "favoravel" || props.ordem == "relevancia") {
      this.temp.sort(function (a, b) {
        if (a[props.ordem] < b[props.ordem]) {
          return props.ordemdir;
        }
        if (a[props.ordem] > b[props.ordem]) {
          return props.ordemdir * -1;
        }
        return 0;
      });
    } else {
      this.temp.sort(function (a, b) {
        if (a[props.ordem] < b[props.ordem]) {
          return props.ordemdir * -1;
        }
        if (a[props.ordem] > b[props.ordem]) {
          return props.ordemdir;
        }
        return 0;
      });
    }

    this.render();
  },
  render: function () {
    var r = rankingPropostas;
    var o = "";

    var pag = document.getElementById("paginacaoAtiva");
    var op = "";
    var ult = Math.floor(this.temp.length / this.posts);
    if (this.page > 2)
      op +=
        '<li><a onclick="props.page=0;props.render();" class="' +
        (0 == this.page ? "ativo" : "") +
        '">Primeiro</a></li><li><a>...</a></li>';
    for (var i = Math.max(0, this.page - 2); i <= Math.min(this.page + 2, ult); i++) {
      op +=
        '<li><a onclick="props.page=' +
        i +
        ';props.render();" class="' +
        (i == this.page ? "ativo" : "") +
        '">' +
        (i + 1) +
        "</a></li>";
    }
    if (this.page < ult - 2)
      op +=
        '<li><a>...</a></li><li><a onclick="props.page=' +
        ult +
        ';props.render();" class="' +
        (ult == this.page ? "ativo" : "") +
        '">Último</a></li>';
    pag.innerHTML = op;

    var inicial = this.page * this.posts;
    var final = (this.page + 1) * this.posts;

    for (var i = inicial; i < Math.min(final, this.temp.length); i++) {
      var d = this.temp[i];
      d.autores = Object.values(d.autores);
      o +=
        "<tr>" +
        '<td data-label="Proposta"><span class="proposta">' +
        d.numero +
        '</span><a href="' +
        home_url +
        "proposta/" +
        d.slug +
        "?legislatura=" +
        legislatura +
        '" class="link-ext">Acompanhe</a></td>' +
        '<td data-label="Autor(es)">';
      o += '<div class="' + (d.autores.length > 1 ? "grupo flex-wrap" : "") + ' flex" style="max-width:150px">';

      if (d.autores)
        d.autores.forEach(function (v, i) {
          var a = props.dados.legislaturas[legislatura].parlamentares[v];
          if (a && ["Deputado", "Senador"].indexOf(a.cargo) != -1) {
            if (d.autores.length == 1) {
              o +=
                '<a href="' +
                home_url +
                "perfil/" +
                a.slug +
                "?legislatura=" +
                legislatura +
                '" class="thumbnail"><img src="' +
                a.foto +
                '" alt="Foto de ' + a.nome + ' (' + a.partido + '-' + a.estado + ')" title="' + a.nome + ' (' + a.partido + '-' + a.estado + ')"></a>';
              o +=
                '<a href="' +
                home_url +
                "perfil/" +
                a.slug +
                "?legislatura=" +
                legislatura +
                '"><p><span class="autor">' +
                a.nome +
                '</span><span class="partido">' +
                a.partido +
                "-" +
                a.estado +
                "</span></p></a>";
            } else {
              o +=
                '<a href="' +
                home_url +
                "perfil/" +
                a.slug +
                "?legislatura=" +
                legislatura +
                '" class="thumbnail" data-tip="' +
                encodeURI("<b>" + a.nome + "</b><br>" + a.partido + "-" + a.estado) +
                '"><img src="' +
                a.foto +
                '" alt="Foto de ' + a.nome + ' (' + a.partido + '-' + a.estado + ')" title="' + a.nome + ' (' + a.partido + '-' + a.estado + ')"></a>';
            }
          } else {
            if (d.autores.length == 1) {
              o +=
                '<span class="thumbnail bgecinativo" data-tip="' +
                encodeURI(
                  "<b>" + a.nome + "</b><br>" + a.partido + "-" + a.estado + "<br>" + genero(a.cargo, a.genero)
                ) +
                '"><img src="' +
                a.foto +
                '" alt="Foto de ' + a.nome + ' (' + a.partido + '-' + a.estado + ')" title="' + a.nome + ' (' + a.partido + '-' + a.estado + ')"></span>';
              o +=
                '<span><p><span class="autor">' +
                a.nome +
                '</span><span class="partido">' +
                a.partido +
                "-" +
                a.estado +
                "</span></p><p><em>Fora de exercício</em></p></span>";
            } else {
              o +=
                '<span class="thumbnail bgecinativo" data-tip="' +
                encodeURI(
                  "<b>" + a.nome + "</b><br>" + a.partido + "-" + a.estado + "<br>" + genero(a.cargo, a.genero)
                ) +
                '"><img src="' +
                a.foto +
                '" alt="Foto de ' + a.nome + ' (' + a.partido + '-' + a.estado + ')" title="' + a.nome + ' (' + a.partido + '-' + a.estado + ')"></span>';
            }
          }
        });
      o +=
        "</div></td>" +
        '<td data-label="Resumo"><span class="resumo">' +
        (d.resumo || '-') +
        "</span></td>" +
        '<td data-label="Avaliador"><span class="avaliador">' +
        (d.avaliador || '-') +
        "</span></td>" +
        '<td data-label="Avaliação"><span class="avaliacao ' +
        cleanName(favoravel(d.favoravel)) +
        '">' +
        favoravel(d.favoravel) +
        "</span></td>" +
        `${
          !!d.quiteria_prob
            ? `
            <td data-label="Quiteriômetro" class="tw:!pt-4">
              <div class="tw:w-24 tw:h-4 tw:bg-gradient-to-r tw:from-[#8cd89c] tw:via-[#f9df79] tw:to-[#ff808a] tw:relative">

                <div class="tw:absolute tw:-translate-x-1/2 tw:left-0 tw:-top-0.5 tw:h-[calc(100%+4px)] tw:w-1.5 tw:bg-black/15"
                style="left: ${d.quiteria_prob * 100}%"
                ></div>
              </div>
              <div class="tw:w-24 tw:relative">
                <div class="tw:absolute tw:-translate-x-1 tw:left-0 tw:-top-3"
                style="left: ${d.quiteria_prob * 100}%"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer2-icon lucide-mouse-pointer-2 tw:fill-white tw:text-black"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/></svg>
                  <div class="tw:text-xs tw:text-center">${d.quiteria_prob}</div>

                </div>
              </div>
            </td>`
            : '<td data-label="Quiteriômetro"><span class="tw:text-3xl tw:opacity-50 ff1 wdth400">-</span></td>'
        }` +
        "</tr>";
    }

    r.innerHTML = o;
    d3.selectAll("[data-tip]")
      .on("mouseenter", function (d) {
        o = d3.select(this).attr("data-tip");
        tooltip.innerHTML = decodeURI(o);
        tooltip.className = "ativo autor";
        positionRetoTooltip(event);
      })
      .on("mousemove", function (d) {
        positionRetoTooltip(event);
      })
      .on("mouseleave", function (d) {
        tooltip.className = "";
      });
  },
};

// Ready

window.addEventListener("load", function () {
  if (graficoPrincipal) app.iniciar();
  if (paginaRanking) rank.iniciar();
  if (rankingPropostas) props.iniciar();
});

var timerResize = false;
window.addEventListener("resize", function () {
  clearTimeout(timerResize);
  timerResize = setTimeout(function () {
    if (graficoPrincipal) app.render();
    if (paginaRanking) rank.montar();
  }, 100);
});
