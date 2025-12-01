const toggle = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const links = document.querySelectorAll(".menu-link");

// Função para carregar páginas com transição suave
function carregarPagina(pagina) {
  const conteudo = document.getElementById("conteudo-principal");

  conteudo.classList.add("fade-out");

  setTimeout(() => {
    fetch(`paginas/${pagina}.html`)
      .then(res => {
        if (!res.ok) throw new Error("Página não encontrada");
        return res.text();
      })
      .then(html => {
        conteudo.innerHTML = html;
        conteudo.classList.remove("fade-out");

        // Lazy load das funcionalidades
        Promise.all([
          carregarRodape(),
          carregarCSSDinamico(pagina),
          inicializarLazyLoading()
        ]).then(() => {
          animarAoEntrarNaTela();
          inicializarAbas();

          // Ativar imagem de fundo para seção de professores
          if (pagina === 'professores') {
            document.body.classList.add('professores-ativo');
            document.body.classList.remove('projetos-ativo');
          } else if (pagina === 'projetos') {
            document.body.classList.add('projetos-ativo');
            document.body.classList.remove('professores-ativo');
          } else {
            document.body.classList.remove('professores-ativo', 'projetos-ativo');
          }

          // Adicionar classe para a seção de obras
          if (pagina === "atividades") {
            document.body.classList.add("atividades-ativo");
          } else {
            document.body.classList.remove("atividades-ativo");
          }

          if (pagina === "nossa-historia") {
            document.body.classList.add("historia-ativo");
          } else {
            document.body.classList.remove("historia-ativo")
          }

          setTimeout(() => {
            // Inicializar cliques no carrossel para páginas com imagens
            if (pagina === 'atividades' || pagina === 'projetos') {
              inicializarClicksCarrossel();
            }

            const carrosseis = document.querySelectorAll('.carrossel-container');
            if (carrosseis.length > 0) iniciarAutoPlay();
          }, 500);
        });
      })
      .catch(err => {
        conteudo.innerHTML = "<p>Página não encontrada.</p>";
        conteudo.classList.remove("fade-out");
        console.error(err);
      });
  }, 200);
}

// Carregamento dinâmico de CSS
function carregarCSSDinamico(pagina) {
  return new Promise((resolve) => {
    if (pagina === 'professores' || pagina === 'atividades') {
      if (!document.getElementById('components-css')) {
        const link = document.createElement('link');
        link.id = 'components-css';
        link.rel = 'stylesheet';
        link.href = 'style-components.css';
        link.onload = resolve;
        document.head.appendChild(link);
      } else {
        resolve();
      }
    } else {
      resolve();
    }
  });
}

// Lazy loading de imagens
function inicializarLazyLoading() {
  // Observer para imagens
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img && img.dataset && img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          if (img.classList) img.classList.remove('lazy');
        }
        imageObserver.unobserve(img);
      }
    });
  });

  // Observer para backgrounds
  const bgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        if (element && element.dataset && element.dataset.bg) {
          element.style.backgroundImage = `url(${element.dataset.bg})`;
          element.removeAttribute('data-bg');
          if (element.classList) element.classList.remove('lazy-bg');
        }
        bgObserver.unobserve(element);
      }
    });
  });

  // Observar todas as imagens lazy
  setTimeout(() => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages && lazyImages.length > 0) {
      lazyImages.forEach(img => {
        if (img && img.classList) imageObserver.observe(img);
      });
    }

    const lazyBGs = document.querySelectorAll('[data-bg]');
    if (lazyBGs && lazyBGs.length > 0) {
      lazyBGs.forEach(bg => {
        if (bg && bg.classList) bgObserver.observe(bg);
      });
    }
  }, 100);
}

// Função para carregar o rodapé
function carregarRodape() {
  fetch("paginas/footer.html")
    .then(res => {
      if (!res.ok) throw new Error("Footer não encontrado");
      return res.text();
    })
    .then(html => {
      const footerContainer = document.getElementById("footer-container");
      if (footerContainer) {
        footerContainer.innerHTML = html;
      }
    })
    .catch(err => console.error("Erro ao carregar rodapé:", err));
}

// Aplica animação ao entrar na tela
function animarAoEntrarNaTela() {
  const elementos = document.querySelectorAll('.section h1, .section h2, .section p, .aula, .depoimento, .projeto');

  if (elementos.length === 0) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target && entry.target.classList) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  elementos.forEach(el => {
    if (el) observer.observe(el);
  });
}

// Funcionalidade das abas dos projetos
function inicializarAbas() {
  const tabButtons = document.querySelectorAll('.tab-button');

  tabButtons.forEach(button => {
    if (!button) return;

    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      const projeto = button.closest('.projeto');

      if (!projeto || !tabId) return;

      // Remove active de todas as abas do projeto atual
      const projectButtons = projeto.querySelectorAll('.tab-button');
      const projectContents = projeto.querySelectorAll('.tab-content');

      projectButtons.forEach(btn => {
        if (btn && btn.classList) btn.classList.remove('active');
      });

      projectContents.forEach(content => {
        if (content && content.classList) content.classList.remove('active');
      });

      // Adiciona active na aba clicada
      if (button.classList) button.classList.add('active');

      const targetContent = document.getElementById(tabId);
      if (targetContent && targetContent.classList) {
        targetContent.classList.add('active');
      }
    });
  });

  // Inicializar modal de imagens
  inicializarModalImagens();
}

// Funcionalidade do modal de imagens
function inicializarModalImagens() {
  // Remove modal existente se houver
  const modalExistente = document.getElementById('modal-imagem');
  if (modalExistente) {
    modalExistente.remove();
  }

  // Criar modal
  const modal = document.createElement('div');
  modal.id = 'modal-imagem';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      <img src="" alt="">
    </div>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('img');
  const closeBtn = modal.querySelector('.modal-close');

  // Adicionar event listeners para todas as imagens da galeria
  const imagens = document.querySelectorAll('.imagens-grid img');
  imagens.forEach(img => {
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Previne scroll do body
    });
  });

  // Fechar modal
  function fecharModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restaura scroll do body
  }

  closeBtn.addEventListener('click', fecharModal);

  // Fechar ao clicar fora da imagem
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      fecharModal();
    }
  });
}

// Carregamento inicial
window.addEventListener("DOMContentLoaded", () => {
  carregarPagina("home");
  carregarRodape();
  inicializarAbas();

  // Botão "Voltar ao topo"
  document.getElementById("btn-topo").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Quando clicar no link do menu
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    const pagina = link.getAttribute("data-pagina");
    carregarPagina(pagina);

    // Remove a classe 'ativo' de todos os links
    links.forEach(l => l.classList.remove("ativo"));

    // Adiciona a classe 'ativo' no link clicado
    link.classList.add("ativo");

    // Fecha o menu lateral
    sidebar.classList.remove("show");
  });
});
// Abrir/fechar menu hambúrguer
toggle.addEventListener("click", () => {
  sidebar.classList.toggle("show");
  toggle.classList.toggle("active");
  toggle.classList.toggle("deactive");
});

// Fecha o menu se clicar fora
document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
    sidebar.classList.remove("show");
  }
});

// Debounce para otimizar scroll
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Mostrar botão "voltar ao topo" ao rolar (otimizado)
const handleScroll = debounce(() => {
  const btnTopo = document.getElementById("btn-topo");
  if (window.scrollY > 300) {
    btnTopo.style.display = "block";
  } else {
    btnTopo.style.display = "none";
  }
}, 100);

window.addEventListener("scroll", handleScroll, { passive: true });

// Função para expandir/recolher texto dos professores e projetos
function toggleTexto(botao) {
  const container = botao.closest('.professor-detalhes') || botao.closest('.projeto-detalhes');

  if (!container) {
    console.error('Container não encontrado');
    return;
  }

  const preview = container.querySelector('.texto-preview');
  const completo = container.querySelector('.texto-completo');

  if (!preview || !completo) {
    console.error('Elementos de texto não encontrados');
    return;
  }

  if (completo.style.display === 'none' || completo.style.display === '') {
    // Mostrar texto completo
    preview.style.display = 'none';
    completo.style.display = 'block';
    botao.textContent = 'Ver menos';
  } else {
    // Mostrar apenas preview
    preview.style.display = 'block';
    completo.style.display = 'none';
    botao.textContent = 'Ver mais';
  }
}

// Função para mostrar detalhes das atividades
function mostrarDetalhes(atividade) {
  const modal = document.getElementById('modal-atividades');
  const conteudo = document.getElementById('conteudo-atividades');

  // Dados das atividades
  const atividades = {
    'workshop-danca': {
      nome: 'Workshop de Dança Contemporânea',
      horarios: 'Sábados - 14h às 17h',
      duracao: '4 semanas',
      valor: 'R$ 280,00',
      professor: 'Shayla Baila e Mariana Lima',
      requisitos: 'Nenhum requisito específico',
      inclusos: 'Material didático, certificado de participação',
      objetivo: 'Desenvolver consciência corporal e expressividade através da dança contemporânea'
    },
    'curso-teatro': {
      nome: 'Curso de Teatro',
      horarios: 'Terças e Quintas - 19h às 21h',
      duracao: '6 meses',
      valor: 'R$ 180,00/mês',
      professor: 'Pedro Del Claro',
      requisitos: 'Idade mínima: 16 anos',
      inclusos: 'Material didático, apresentação final',
      objetivo: 'Formar atores com base sólida em interpretação e expressão cênica'
    },
    'lab-criacao': {
      nome: 'Laboratório de Criação',
      horarios: 'Flexível - por agendamento',
      duracao: 'Processo contínuo',
      valor: 'R$ 120,00/mês',
      professor: 'Carlos Veloso',
      requisitos: 'Experiência prévia em artes cênicas',
      inclusos: 'Orientação artística, espaço para ensaios',
      objetivo: 'Desenvolver projetos autorais e pesquisa artística individual'
    },
    'criancas': {
      nome: 'Dança e Teatro para Crianças',
      horarios: 'Sábados - 10h às 11h30',
      duracao: 'Anual (com recesso)',
      valor: 'R$ 100,00/mês',
      professor: 'Gisele Emiko e Giulia Stuche',
      requisitos: 'Idade: 6 a 12 anos',
      inclusos: 'Material lúdico, apresentação semestral',
      objetivo: 'Desenvolver criatividade e coordenação motora através da arte'
    },
    'residencia': {
      nome: 'Residência Artística',
      horarios: 'Período integral durante a residência',
      duracao: '2 a 4 semanas',
      valor: 'Sem custo (por seleção)',
      professor: 'Todo o coletivo',
      requisitos: 'Portfolio artístico e projeto definido',
      inclusos: 'Espaço, orientação, apresentação final',
      objetivo: 'Intercâmbio cultural e desenvolvimento de projetos autorais'
    },
    'festivais': {
      nome: 'Preparação para Festivais',
      horarios: 'Intensivo - Seg a Sex - 18h às 20h',
      duracao: '8 semanas',
      valor: 'R$ 400,00',
      professor: 'Todo o elenco',
      requisitos: 'Nível intermediário/avançado',
      inclusos: 'Orientação para inscrições, material audiovisual',
      objetivo: 'Preparar artistas para competições e festivais nacionais'
    }
  };

  const dadosAtividade = atividades[atividade];

  if (dadosAtividade) {
    let html = `
      <h3>${dadosAtividade.nome}</h3>
      <div class="atividade-detalhes">
        <div class="detalhe-item">
          <h4>Horários</h4>
          <p>${dadosAtividade.horarios}</p>
        </div>
        <div class="detalhe-item">
          <h4>Duração</h4>
          <p>${dadosAtividade.duracao}</p>
        </div>
        <div class="detalhe-item">
          <h4>Investimento</h4>
          <p>${dadosAtividade.valor}</p>
        </div>
        <div class="detalhe-item">
          <h4>Professor(es)</h4>
          <p>${dadosAtividade.professor}</p>
        </div>
        <div class="detalhe-item">
          <h4>Requisitos</h4>
          <p>${dadosAtividade.requisitos}</p>
        </div>
        <div class="detalhe-item">
          <h4>Inclusos</h4>
          <p>${dadosAtividade.inclusos}</p>
        </div>
        <div class="detalhe-item">
          <h4>Objetivo</h4>
          <p>${dadosAtividade.objetivo}</p>
        </div>
      </div>
    `;

    conteudo.innerHTML = html;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Configurar event listeners para fechar o modal
    configurarEventListenersModalAtividades();
  }
}

// Função para inscrever em atividades
function inscreverAtividade(atividade) {
  // Aqui você pode implementar a lógica de inscrição
  alert('Redirecionando para inscrição... (funcionalidade a ser implementada)');
}

// Função para fechar modal de atividades
function fecharModalAtividades() {
  const modal = document.getElementById('modal-atividades');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

// Função para configurar event listeners do modal de atividades
function configurarEventListenersModalAtividades() {
  const modal = document.getElementById('modal-atividades');

  if (modal) {
    // Remove event listeners anteriores para evitar duplicatas
    const novoModal = modal.cloneNode(true);
    modal.parentNode.replaceChild(novoModal, modal);

    const modalAtualizado = document.getElementById('modal-atividades');
    const closeBtn = modalAtualizado.querySelector('.modal-close');

    // Event listener para o botão X
    if (closeBtn) {
      closeBtn.addEventListener('click', fecharModalAtividades);
    }

    // Fechar ao clicar fora do conteúdo
    modalAtualizado.addEventListener('click', (e) => {
      if (e.target === modalAtualizado) {
        fecharModalAtividades();
      }
    });

    // Fechar com ESC
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalAtualizado.classList.contains('show')) {
        fecharModalAtividades();
        document.removeEventListener('keydown', handleEscape);
      }
    };

    document.addEventListener('keydown', handleEscape);
  }
}

// Função para preload de imagens próximas
function preloadImagensProximas(container, indiceAtual) {
  const imagens = container.querySelectorAll('.carrossel-img');
  if (!imagens || imagens.length === 0) return;

  // Preload da imagem anterior e próxima
  const indices = [
    (indiceAtual - 1 + imagens.length) % imagens.length,
    (indiceAtual + 1) % imagens.length
  ];

  indices.forEach(indice => {
    const img = imagens[indice];
    if (img && img.src && !img.complete) {
      // Força o carregamento da imagem
      const preloadImg = new Image();
      preloadImg.src = img.src;
    }
  });
}

// Função para controlar carrossel de imagens
function mudarSlide(botao, direcao) {
  if (!botao) return;

  const container = botao.closest('.carrossel-container');
  if (!container) return;

  const imagens = container.querySelectorAll('.carrossel-img');
  const indicadores = container.querySelectorAll('.indicador');

  if (imagens.length === 0) return;

  let slideAtivo = 0;
  imagens.forEach((img, index) => {
    if (img && img.classList && img.classList.contains('active')) {
      slideAtivo = index;
    }
  });

  // Remove active atual
  if (imagens[slideAtivo] && imagens[slideAtivo].classList) {
    imagens[slideAtivo].classList.remove('active');
  }
  if (indicadores[slideAtivo] && indicadores[slideAtivo].classList) {
    indicadores[slideAtivo].classList.remove('active');
  }

  // Calcula próximo slide
  slideAtivo += direcao;
  if (slideAtivo >= imagens.length) slideAtivo = 0;
  if (slideAtivo < 0) slideAtivo = imagens.length - 1;

  // Adiciona active no novo slide
  if (imagens[slideAtivo] && imagens[slideAtivo].classList) {
    imagens[slideAtivo].classList.add('active');
  }
  if (indicadores[slideAtivo] && indicadores[slideAtivo].classList) {
    indicadores[slideAtivo].classList.add('active');
  }

  // Preload das imagens próximas
  preloadImagensProximas(container, slideAtivo);
}

// Função para ir para slide específico
function slideAtual(indicador, slideIndex) {
  if (!indicador) return;

  const container = indicador.closest('.carrossel-container');
  if (!container) return;

  const imagens = container.querySelectorAll('.carrossel-img');
  const indicadores = container.querySelectorAll('.indicador');

  if (imagens.length === 0 || slideIndex < 1 || slideIndex > imagens.length) return;

  // Remove active de todos
  imagens.forEach(img => {
    if (img && img.classList) img.classList.remove('active');
  });
  indicadores.forEach(ind => {
    if (ind && ind.classList) ind.classList.remove('active');
  });

  // Adiciona active no slide selecionado
  const targetIndex = slideIndex - 1;
  if (imagens[targetIndex] && imagens[targetIndex].classList) {
    imagens[targetIndex].classList.add('active');
  }
  if (indicadores[targetIndex] && indicadores[targetIndex].classList) {
    indicadores[targetIndex].classList.add('active');
  }

  // Preload das imagens próximas
  preloadImagensProximas(container, targetIndex);
}

// Função para expandir/recolher texto completo das atividades
function toggleTextoCompleto(botao) {
  const detalhes = botao.closest('.professor-detalhes');
  const preview = detalhes.querySelector('.texto-preview');
  const completo = detalhes.querySelector('.texto-completo');

  if (completo.style.display === 'none') {
    // Mostrar texto completo
    preview.style.display = 'none';
    completo.style.display = 'block';
    botao.textContent = 'Ver menos';
  } else {
    // Mostrar apenas preview
    preview.style.display = 'block';
    completo.style.display = 'none';
    botao.textContent = 'Ver mais';
  }
}

// Função para mostrar detalhes específicos de atividades
function mostrarDetalhesAtividade(atividade) {
  const modal = document.getElementById('modal-atividades');
  const conteudo = document.getElementById('conteudo-atividades');

  // Dados específicos das atividades principais
  const atividadesEspeciais = {
    'objeto-abjeto': {
      nome: 'Objeto/Abjeto Ambulante',
      tipo: 'Espetáculo de Dança-Teatro',
      ano: '2019 - Presente',
      descricao: 'Espetáculo que investiga as camadas de opressão vividas por trabalhadores do século XXI',
      conceito: 'Fruto da inquietação diante da ascensão de discursos autoritários no Brasil contemporâneo',
      coreografo: 'Carlos Veloso em parceria com o elenco',
      musica: 'Edição e mixagem por Miguel Vulcano, com composições de Chico Buarque',
      figurino: 'Inspirado na classe trabalhadora dos anos 70 - camisas, calças sociais e macacões',
      cenografia: 'Duas araras com elásticos, criando um campo simbólico de opressão e resistência',
      estreia: '8 e 9 de março de 2019 - Centro de Referência da Dança',
      apresentacoes: 'Teatro Clara Nunes (Diadema), Sesc Itaquera, Festidança',
      fomento: 'Programa VAI, ProAC Municípios',
      elencoOriginal: 'Vinycias Pereira, Matheus Nascimento, Paulo Felito, Carlos Veloso, Daniela Corrêa, Giovanna Falcade, Júlia Falcade, Giovana Baraldi, Ingrid Catharine, Isabela Pinheiro, Mariana Morgado, Andressa Passos',
      remontagem: 'Mariana Morgado, Paulo Felito, Gisele Emiko, Carol Veloso, Letícia Almeida, Shayla Baila, Giulia Stuche, Gustavo Coutinho, Aline Peixoto, Duda Ryan, Julya Hellen, Vinycias Pereira, Giovana Baraldi, Ingridi Catharine',
      processo: 'A criação envolveu estudos sobre a história da ditadura civil militar no Brasil, e o estudo de diversas nuances de movimentação corporal: movimentação estacato, o lado reverso e a movimentação articular',
      impacto: 'Espetáculo de forte impacto social e político, que provoca reflexão crítica sobre o trabalho e suas violências. O uso da voz como movimento inaugurou novas camadas poéticas no trabalho do grupo.'
    },
    'onze-quarentenas': {
      nome: 'Onze Quarentenas em um Corpo',
      tipo: 'Solo de Dança-Teatro',
      ano: '2020',
      descricao: 'Solo criado durante o auge do isolamento social',
      conceito: 'Resposta sensível às inquietações vividas por cada integrante do Coletivo Corpos Falantes na pandemia',
      coreografo: 'Carlos Veloso',
      musica: 'Edição e mixagem por Carlos Veloso com assistência de Edson Burgos',
      figurino: 'Improvisado com roupas cotidianas; um blazer atravessa a dramaturgia como símbolo de contenção e repetição',
      cenografia: 'Não há cenografia fixa',
      estreia: '18 de junho de 2020 em live do Centro de Referência da Dança',
      apresentacoes: 'Via Zoom, de forma independente pelo canal do YouTube do Espaço Cultural Corpos Falantes',
      fomento: 'Centro de Referência da Dança/SP',
      elencoOriginal: 'Carlos Veloso',
      processo: 'Baseado em entrevistas com os integrantes do grupo, o processo foi profundamente íntimo e coletivo',
      impacto: 'A obra ressoou fortemente entre espectadores que viviam realidades semelhantes. As questões de saúde mental, vulnerabilidade e sensação de suspensão foram acolhidas com empatia.'
    },
    'complexo-nina': {
      nome: 'Complexo de Nina',
      tipo: 'Espetáculo Virtual',
      ano: '2020',
      descricao: 'Denuncia o aumento de feminicídios na pandemia',
      conceito: 'Inspirada na peça Quando as Máquinas Param, de Plínio Marcos, dá corpo à personagem Nina',
      coreografo: 'Carlos Veloso e elenco',
      musica: 'Edição e mixagem por Miguel Vulcano',
      figurino: 'Figurinos diversos construídos pelos próprios intérpretes',
      cenografia: 'Sem cenografia fixa',
      estreia: '10 de julho de 2020 via YouTube',
      apresentacoes: 'Festival Oxandolá e selecionado para a 2ª Bienal do Corpo Contemporâneo',
      fomento: 'Independente',
      elencoOriginal: 'Carol Veloso, Gisele Emiko, Ana Stiebler, Mariana Morgado, Julia Falcade, Shayla Baila, Giovana Baraldi, Ingrid Catarine, Paulo Felito, Daniela Corrêa, Vinycias Pereira',
      processo: 'Construído coletivamente por meio de encontros virtuais, compartilhamento de relatos, experimentações em casa e leitura da peça',
      impacto: 'A obra ecoou como um grito coletivo. Mulheres do público se reconheceram, intérpretes revisitaram feridas'
    },
    'quem-me-diz': {
      nome: '4 Quem Sou',
      tipo: 'Vídeo-Espetáculo',
      ano: '2020 e 2022',
      descricao: 'Escuta atenta às infâncias durante o isolamento social',
      conceito: 'Olhar sensível para o universo das crianças que estudaram à distância',
      coreografo: 'Carlos Veloso e elenco',
      musica: 'Trilha editada por Miguel Vulcano',
      figurino: 'Improvisado a partir de elementos caseiros (versão 2020)',
      cenografia: 'Cenografia mínima e simbólica',
      estreia: '8 de novembro de 2020 (virtual)',
      apresentacoes: 'Escolas de Jundiaí, Festival Oxandolá e circulação virtual. Remontado presencialmente em 2022',
      fomento: 'ProESC Jundiaí',
      elencoOriginal: 'Carol Veloso, Gisele Emiko, Ana Stiebler, Mariana Morgado, Julia Falcade, Shayla Baila, Giovana Baraldi, Ingrid Catarine, Paulo Felito, Daniela Corrêa, Vinycias Pereira',
      processo: 'Com base em entrevistas e relatos de crianças e resgate de suas próprias histórias',
      impacto: 'A obra comoveu pais, educadores e crianças. Reconheceram-se nas cenas de saudade, silêncio e descoberta'
    },
    'capitas-videodancas': {
      nome: 'Capitãs do Asfalto - Videodanças',
      tipo: 'Projeto Audiovisual',
      ano: '2021',
      descricao: 'Série de 14 vídeos sobre mulheres em situação de rua',
      conceito: 'Inspirado em Capitães da Areia, adaptado à realidade de mulheres em situação de rua em São Paulo',
      coreografo: 'Carlos Veloso em parceria com cada intérprete',
      musica: 'Edição e mixagem por Miguel Vulcano',
      figurino: 'Figurinos criados por cada intérprete a partir de suas pesquisas',
      cenografia: 'Sem cenografia fixa',
      estreia: '8 de maio de 2021',
      apresentacoes: 'Série lançada diariamente pelo Instagram e YouTube do coletivo',
      fomento: 'Programa VAI (2020), 10º Circuito Vozes do Corpo da Cia Sansacroma',
      elencoOriginal: 'Ingrid Catarine, Ana Stiebler, Carol Veloso, Mariana Morgado, Gisele Emiko, Paulo Felito, Vinícius Pereira, Aline Peixoto, Julya Ellen, Daniela Corrêa, Shayla Baila, Carlos Veloso, Giovana Baraldi',
      processo: 'Criação individual com orientação remota de Carlos Veloso. Cada intérprete construiu sua personagem',
      impacto: 'Os vídeos se tornaram instrumentos de sensibilização e educação'
    },
    'relicario': {
      nome: 'Relicário',
      tipo: 'Espetáculo de Dança',
      ano: '2021 e 2023',
      descricao: 'Mergulho na psicologia de uma mulher enclausurada',
      conceito: 'Inspirado no conto Venha Ver o Pôr do Sol, de Lygia Fagundes Telles',
      coreografo: 'Carlos Veloso e elenco',
      musica: 'Mixagem por Miguel Vulcano',
      figurino: 'Figurinos casuais e mais densos, remetendo ao universo do luto e da memória',
      cenografia: 'Cenografia mínima e simbólica',
      estreia: '24 de novembro de 2021',
      apresentacoes: '20 de agosto de 2023 – Duas Danças: Reflexões Submersas do Tempo (São Caetano)',
      fomento: 'Lei Aldir Blanc (2020)',
      elencoOriginal: 'Carlos Veloso, Mariana Morgado, Daniela Corrêa, Ingrid Catarine, Paulo Felito, Giovanna Baraldi, Vinícyas Pereira',
      processo: 'Ensaio presencial com ênfase em dramaturgia do gesto e pesquisa de qualidades corporais',
      impacto: 'Uma das obras mais delicadas e estruturadas do grupo. Jazz contemporâneo poético e íntimo'
    },
    'beleza-ser-quem-somos': {
      nome: 'A Beleza de Ser Quem Somos',
      tipo: 'Espetáculo Infantil',
      ano: '2024',
      descricao: 'Universo da infância e o reconhecimento das diferenças',
      conceito: 'Inspirado na obra Quem Me Diz Quem Sou, explorando o primeiro dia de aula de um grupo de crianças',
      coreografo: 'Carlos Veloso e elenco',
      musica: 'Trilha original de Felipe Júlio',
      figurino: 'Figurino por Dora Lima',
      cenografia: 'Cenografia por Carol Veloso',
      estreia: '19 de agosto de 2024',
      apresentacoes: 'Temporada no Teatro Arthur Azevedo em maio de 2025',
      fomento: 'Programa VAI (2024), Secretaria Municipal de Cultura (difusão 2025)',
      elencoOriginal: 'Julya Ellen, Mariana Morgado, Pedro Delclaro, Carol Veloso, Shayla Baila, Paulo Felito, Gisele Emiko',
      processo: 'Criação por meio de composição de personagens. Cada intérprete desenvolveu um universo próprio',
      impacto: 'Obra sensível, lúdica e inclusiva, provocou identificação, empatia e reconhecimento'
    },
    'vozes-ultimo': {
      nome: 'Vozes de Último',
      tipo: 'Espetáculo Experimental',
      ano: '2024',
      descricao: 'Mergulho nas profundezas da existência',
      conceito: 'Criado e dirigido por Mariana Morgado, convoca o público a confrontar seus medos',
      coreografo: 'Mariana Morgado',
      musica: 'Mixagem por Carlos Veloso (escolhas de Mariana Morgado)',
      figurino: 'Figurino independente e simbólico',
      cenografia: 'Cenografia independente e simbólica',
      estreia: '9 de dezembro de 2024 no Espaço dos Sátyros',
      apresentacoes: 'Temporada em 2025 com apoio do Centro da Terra',
      fomento: 'Independente',
      elencoOriginal: 'Julya Hellen Ellen, Pedro Delclaro, Carol Veloso, Shayla Baila, Paulo Felito, Gisele Emiko',
      processo: 'Um processo intenso, físico e coletivo, conduzido por Mariana Morgado',
      impacto: 'Espetáculo denso e visceral. O estranhamento se transforma em reflexão'
    },
    'capitas-espetaculo': {
      nome: 'Capitãs do Asfalto: O Espetáculo',
      tipo: 'Espetáculo de Forró e Dança',
      ano: '2025',
      descricao: 'Corpos anestesiados pelo sistema frente à realidade das pessoas em situação de rua',
      conceito: 'Discussão sobre corpos anestesiados pelo sistema, misturando forró universitário e dança contemporânea',
      coreografo: 'Carlos Veloso e elenco',
      musica: 'Trilha original de Felipe Júlio',
      figurino: 'Figurino por Dora Lima',
      cenografia: 'Cenografia com máscaras criadas por Vitor e Patrícia Polzl',
      estreia: '7 de junho de 2025 na Galeria Olido (SP)',
      apresentacoes: 'Em cartaz',
      fomento: 'Fomento ao Forró – 4ª edição',
      elencoOriginal: 'Julya Hellen, Pedro Delclaro, Shayla Baila, Paulo Felito, Gisele Emiko, Mariana Morgado, Giulia Stuche',
      processo: 'Iniciado com pesquisa de forró universitário, atravessado por estudos sobre anestesiamento',
      impacto: 'A obra provocou o público com questões difíceis. Recepção marcada por emoção e reflexão'
    }
  };

  const dadosAtividade = atividadesEspeciais[atividade];

  if (dadosAtividade) {
    let html = `
      <h3>${dadosAtividade.nome}</h3>
      <div class="atividade-detalhes-modal">
        <div class="detalhe-item">
          <h4>Tipo e Período</h4>
          <p><strong>Tipo:</strong> ${dadosAtividade.tipo}</p>
          <p><strong>Período:</strong> ${dadosAtividade.ano}</p>
        </div>

        <div class="detalhe-item">
          <h4>Conceito e Inspiração</h4>
          <p>${dadosAtividade.conceito}. ${dadosAtividade.descricao}.</p>
        </div>

        <div class="detalhe-item">
          <h4>Elementos Técnicos</h4>
          <p><strong>Coreografia:</strong> ${dadosAtividade.coreografo}</p>
          <p><strong>Música:</strong> ${dadosAtividade.musica}</p>
          <p><strong>Figurino:</strong> ${dadosAtividade.figurino}</p>
          <p><strong>Cenografia:</strong> ${dadosAtividade.cenografia}</p>
        </div>

        <div class="detalhe-item">
          <h4>Processo de Criação</h4>
          <p>${dadosAtividade.processo}</p>
        </div>

        <div class="detalhe-item">
          <h4>Histórico de Apresentações</h4>
          <p><strong>Estreia:</strong> ${dadosAtividade.estreia}</p>
          <p><strong>Outras apresentações:</strong> ${dadosAtividade.apresentacoes}</p>
          <p><strong>Fomento:</strong> ${dadosAtividade.fomento}</p>
        </div>

        <div class="detalhe-item">
          <h4>Elenco Original (2019)</h4>
          <p>${dadosAtividade.elencoOriginal}</p>
        </div>

        <div class="detalhe-item">
          <h4>Remontagem (2021)</h4>
          <p>${dadosAtividade.remontagem}</p>
        </div>

        <div class="detalhe-item">
          <h4>Recepção e Impacto</h4>
          <p>${dadosAtividade.impacto}</p>
        </div>
      </div>
    `;

    conteudo.innerHTML = html;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Configurar event listeners para fechar o modal
    configurarEventListenersModalAtividades();
  }
}

// Função para manifestar interesse em atividades
function interesseAtividade(atividade) {
  alert('Obrigado pelo interesse! Em breve entraremos em contato com mais informações sobre esta atividade.');
}

// Função para navegar para a seção de projetos
function navegarParaProjetos(atividade) {
  const linkProjetos = document.querySelector('.menu-link[data-pagina="projetos"]');
  if (linkProjetos) {
    linkProjetos.click();
  }
}

// Função para navegar para a seção de obras
function navegarParaObras(atividade) {
  const linkObras = document.querySelector('.menu-link[data-pagina="atividades"]');
  if (linkObras) {
    linkObras.click();
  }
}

// Auto-play do carrossel
function iniciarAutoPlay() {
  const carrosseis = document.querySelectorAll('.carrossel-container');

  carrosseis.forEach(carrossel => {
    // Adiciona um identificador único para cada carrossel
    const carrosselId = Math.random().toString(36).substr(2, 9);
    carrossel.setAttribute('data-carrossel-id', carrosselId);

    // Preload inicial das primeiras imagens
    const imagens = carrossel.querySelectorAll('.carrossel-img');
    if (imagens.length > 0) {
      preloadImagensProximas(carrossel, 0);
    }

    const intervalo = setInterval(() => {
      // Verifica se o carrossel ainda existe na página
      if (!document.querySelector(`[data-carrossel-id="${carrosselId}"]`)) {
        clearInterval(intervalo);
        return;
      }

      const btnProximo = carrossel.querySelector('.carrossel-btn:last-child');
      if (btnProximo) {
        mudarSlide(btnProximo, 1);
      }
    }, 4000); // Muda slide a cada 4 segundos

    // Pausa o auto-play quando o mouse está sobre o carrossel
    carrossel.addEventListener('mouseenter', () => {
      clearInterval(intervalo);
    });

    // Reinicia o auto-play quando o mouse sai do carrossel
    carrossel.addEventListener('mouseleave', () => {
      iniciarAutoPlayIndividual(carrossel);
    });
  });
}

// Função para iniciar auto-play individual
function iniciarAutoPlayIndividual(carrossel) {
  const carrosselId = carrossel.getAttribute('data-carrossel-id');

  const intervalo = setInterval(() => {
    if (!document.querySelector(`[data-carrossel-id="${carrosselId}"]`)) {
      clearInterval(intervalo);
      return;
    }

    const btnProximo = carrossel.querySelector('.carrossel-btn:last-child');
    if (btnProximo) {
      mudarSlide(btnProximo, 1);
    }
  }, 4000);

  // Limpa intervalos anteriores
  if (carrossel.autoPlayInterval) {
    clearInterval(carrossel.autoPlayInterval);
  }
  carrossel.autoPlayInterval = intervalo;
}

// Função para mostrar trabalhos dos professores
function mostrarTrabalhos(professor) {
  const modal = document.getElementById('modal-trabalhos');
  const conteudo = document.getElementById('conteudo-trabalhos');

  // Dados dos trabalhos (aqui você pode expandir com mais professores)
  const trabalhos = {
    carlos: {
      nome: 'Carlos Veloso',
      trabalhos: [

        {
          titulo: 'Coletivo Corpos Falantes',
          descricao: 'Diretor artístico do Coletivo Corpos Falantes',
          ano: '2018'
        },

        {
          titulo: 'Espaço Cultural Corpos Falantes',
          descricao: 'Fundador e diretor do Espaço Cultural Corpos Falantes',
          ano: '2018'
        },

        {
          titulo: 'Coreógrafo',
          descricao: 'Coreógrafo das obras:Ô Saudade (2015), Objeto Abjeto Ambulante (2019), Relicário(2021), Subtexto(2023), A Beleza de Ser Quem Somos (2024) e Capitãs do Asfalto (2025)',
          ano: '2015 a 2025'
        },

        {
          titulo: 'Bailarino',
          descricao: 'Em companhias como Raça Cia de Dança, Anacã Cia de Dança e Companhia de Danças de Diadema',
          ano: '##'
        },

        {
          titulo: 'Participação internacional em projetos',
          descricao: ' Biblioteca do Corpo',
          ano: '2017'
        },

        {
          titulo: 'Premiado',
          descricao: 'Pela Funarte, Lei Aldir Blanc, Festival Santa Dança e Festidança',
          ano: '##'
        },

        {
          titulo: 'Aprovados por leis de incentivo à cultura',
          descricao: 'Mais de 15 projetos aprovados por leis de incentivo à cultura como Programa VAI, ProAC Editais, Promac e Fomento ao Forró',
          ano: '2010'
        },

        {
          titulo: 'Doutorando',
          descricao: 'Em Artes da Cena pela Unicamp',
          ano: '2025'
        }
      ]
    },
    shayla: {
      nome: 'Shayla Baila',
      trabalhos: [
        {
          titulo: 'Coletivo Corpos Falantes, direção: Carlos Veloso',
          descricao: ' “Complexo de Nina” (2020), “Capitãs do Asfalto” (2021 e 2025), “Objeto/Abjeto Ambulante” (2022), “Relicário” (2023), “Vozes de um túmulo” (2024) coreógrafa: Mariana Morgado, “A beleza de sermos quem somos” (2024)',
          ano: '2020 a 2025'
        },
        {
          titulo: 'Cia Diversidança, direção: Rodrigo Cândido',
          descricao: ' “Dançando por alguns cantos”, “Tirem os sapatos e dancem conosco”.',
          ano: '2025'
        },
        {
          titulo: 'Cia Os Satyros, direção: André Lu.',
          descricao: '“Fluxo”.',
          ano: '2024'
        },
        {
          titulo: 'Núcleo Cinematográfico , direção: Maristela Estrela e Mariana Sucupira.',
          descricao: '“Peça no. 4”.',
          ano: '2024'
        },

        {
          titulo: 'Rumo Cia Experimental de Dança, direção: Edson Burgos',
          descricao: '“Diálogos”.',
          ano: '2024'
        },

        {
          titulo: 'Núcleo Luz - 2019 a 2023, direção: Chirs Belluomini',
          descricao: '“O Lago de Nós” (2019), “Fragmentos” (2022 - 2023), solo autoral “POÉTICA DO CORROMPIDO” (2023), “B eira” (2023).',
          ano: '2019 a 2023'
        },

        {
          titulo: 'Residência artística na Companhia de Dança de Diadema pelo ABC Dança, direção: Companhia de Dança de Diadema',

          descricao: 'solo autoral “Corpo Objeto”',
          ano: '2020'
        },

        {
          titulo: 'Turminha do Corpos, direção: Carlos Veloso',

          descricao: ' “Quem me Diz Quem Sou?” contação de histórias em escolas estaduais (2022)',
          ano: '2021 a 2024'

        },

        {
          titulo: '* Coletivo Mútuo, direção: Lucas Pardin',

          descricao: '“Pra deixar de existir ao Sol” (2023) ',


          ano: '2022 a 2023'

        },

        {
          titulo: 'Dentre Nós Cia de Dança, direção: Rivaldo Ferreira',

          descricao: '“Rosas danst Rosas”',
          ano: '2023'
        }
      ]
    },


    pedro: {
      nome: 'Pedro Del Claro',
      trabalhos: [
        {
          titulo: 'Direção Teatral',
          descricao: 'Mais de 20 peças dirigidas, focando em teatro experimental e psicologia dos personagens.',
          ano: '2012 - Atual'
        },
        {
          titulo: 'Formação EAD-USP',
          descricao: 'Graduação em Artes Cênicas com especialização em direção teatral.',
          ano: '2015'
        },
        {
          titulo: 'Consultoria Artística',
          descricao: 'Consultor artístico para produções independentes de teatro.',
          ano: '2018 - Atual'
        },
        {
          titulo: 'Workshop de Interpretação',
          descricao: 'Ministra workshops sobre técnicas inovadoras de interpretação.',
          ano: '2016 - Atual'
        }
      ]
    },

    gisele: {
      nome: 'Gisele Emiko',
      trabalhos: [
        {
          titulo: '"O Show da Luna"',
          descricao: 'Caracterização de personagem - Musical infantil realizado pela produtora PinGuim Content.',
          ano: '2017 a 2025'
        },
        {
          titulo: '"O Show do Bita"',
          descricao: 'Caracterização de personagem - Musical infantil realizado pela produtora QG Produções.',
          ano: '2022 a 2025'
        },
        {
          titulo: '"Zona 21",direção: Carlos Veloso e Felipe Julio',
          descricao: 'Bailarina -Espetáculo produzido pela Residência “Fluxo Invisível” - Projeto aprovado pelo PROAC Nº15/2024 - CultSP',
          ano: '2025'
        },
        {
          titulo: '"Capitãs do Asfalto", direção: Carlos Veloso',
          descricao: 'Projeto contemplado pela 4ª Edição do Programa Municipal de Fomento ao Forró para a cidade de São Paulo2024.',
          ano: '2025'
        },

        {
          titulo: '"Vozes de um Túmulo", direção: Mariana Morgado',
          descricao: 'Intérprete-criadora em Teatro Centro da Terra, SP',
          ano: '2025'

        },
        {
          titulo: '"Quem me diz quem sou?", direção: Carlos Veloso ',
          descricao: 'Turminha do Corpos - Projeto contemplado pelo programa VAI',
          ano: '2024'

        },
        {
          titulo: '"Auto da Barca do Inferno", direção: Manoela Flor',
          descricao: 'Atriz - Espetáculo adaptado da obra de Gil Vicente - Cia Culto à Dionísio - Contemplado pelo edital Funcultura para Jovens Artistas da cidade de Guarulhos, SP',
          ano: '2023 a 2024'

        },
        {
          titulo: '"Relicário", direção: Carlos Veloso',
          descricao: 'Intérprete-criadora - Coletivo Corpos Falantes - Teatro Santos Dumont, São Caetano,SP',
          ano: '2023'

        },
        {
          titulo: '"Objeto/Abjeto Ambulante", direção: Carlos Veloso',
          descricao: 'Intérprete-criadora - Coletivo Corpos Falantes - Projeto contemplado pela Lei Aldir Blanc - Teatro Flávio Império, SP',
          ano: '2021'

        },
        {
          titulo: '"Complexo de Nina" direção: Carlos Veloso',
          descricao: 'ntérprete-criadora - Coletivo Corpos Falantes - Projeto contemplado pela Lei Aldir Blanc apresentado através da plataforma Zoom',
          ano: '2020'

        },
        {
          titulo: '"Enquanto as Carpas Flutuavam", direção: Isadora Primon ',
          descricao: 'Curta-metragem desenvolvido para “TCC” de Rádio e TV',
          ano: '2019'

        },
        {
          titulo: '"Hair", coreografia: Milton André ',
          descricao: ' Bailarina - Youth America Grand Prix – YAGP - Nova York,US-NY',
          ano: '2015'

        },
        {
          titulo: '"Concerto in Cielo", coreografia: Mariana Camargo ',
          descricao: 'Bailarina - Youth America Grand Prix – YAGP - Nova York,US-NY',
          ano: '2015'

        },
      ]
    },


    mariana: {
      nome: 'Mariana Morgado',
      trabalhos: [
        {
          titulo: ' "Vozes de um túmulo "',
          descricao: 'Criação de um Espetáculo para o Coletivo Corpos Falantes.',
          ano: '2024 a 2025'
        },
        {
          titulo: '"Estado Independente" e "Konstituição"',
          descricao: 'Residência artística com Carne Agonizante, participando dos espetáculos.',
          ano: '2024'
        },
        {
          titulo: '"Espetáculo Principiar"',
          descricao: 'Anacã companhia de dança.',
          ano: '2024'
        },
        {
          titulo: '"Objeto/Abjeto ambulante", "Relicário", "A beleza de ser quem somos", "Capitãs do Asfalto"',
          descricao: 'Coletivo Corpos Falantes 2018, 2023,2024,2025.',
          ano: '2018 - Atual'
        },

        {
          titulo: '"Renascimento"',
          descricao: 'Anacã companhia de dança',
          ano: '2018'

        },

        {
          titulo: '"Kantuta FID SCZ Bolivia"',
          descricao: 'Rumos Cia Experimental de dança',
          ano: '2018'

        }

      ]
    },

    paulo: {
      nome: 'Paulo Felito',
      trabalhos: [
        {
          titulo: 'Coletivo Corpos Falantes, direção: Carlos Veloso',
          descricao: '“Capitãs do Asfalto” (2021 e 2025), “Objeto/Abjeto Ambulante” (2022), “Quem me diz quem sou? ” (2024)',
          ano: '2020 a 2025'
        },
        {
          titulo: '"Capitãs do Asfalto"',
          descricao: 'Atuou como intérprete criador participou das pesquisas, elaboração e circulação ',
          ano: '2021 e 2025'
        },
        {
          titulo: '"Objeto/Abjeto Ambulante"',
          descricao: 'Atuou como intérprete criador participou das pesquisas, elaboração e circulação',
          ano: '2022'
        },
        {
          titulo: '"Quem me diz quem sou?"',
          descricao: 'Atuou como intérprete criador participou das pesquisas, elaboração e circulação',
          ano: '2024'
        },
        {
          titulo: '"Padê do Núcleo Ajeum"',
          descricao: 'Participou Da pesquisa e circulação pelo incentivo do FOMENTO A DANÇA.',
          ano: '2023'

        }
      ]
    },



    giulia: {
      nome: 'Giulia Stuche',
      trabalhos: [
        {
          titulo: 'Coletivo Corpos Falantes',
          descricao: 'Atua como intérprete e criadora do Coletivo Corpos Falantes e como professora de ballet clássico',
          ano: '2022'
        },
        {
          titulo: 'Soraia Rocha Escola de Dança e Cia',
          descricao: 'iniciou seus estudos em Ballet Clássico e Jazz Dance ',
          ano: '2011'
        },
        {
          titulo: 'Grupo Experimental Soraia Rocha',
          descricao: 'Atuou em pesquisa e experiência nas modalidades de Jazz como bailarina e coordenadora',
          ano: '2022'
        },
        {
          titulo: 'Dança Contemporânea ',
          descricao: 'com Coletivo Corpos Falantes',
          ano: '2022 a 2025'
        },
        {
          titulo: 'Cia Experimental Raça',
          descricao: 'Compõe o elenco de c',
          ano: '2023'

        }
      ]
    },

    carol: {
      nome: 'Carol Veloso',
      trabalhos: [
        {
          titulo: '',
          descricao: '',
          ano: ''

        }
      ]
    }
  };



  const dadosProfessor = trabalhos[professor];

  if (dadosProfessor) {
    let html = `<h3>Trabalhos de ${dadosProfessor.nome}</h3>`;

    dadosProfessor.trabalhos.forEach(trabalho => {
      html += `
        <div class="trabalho-item">
          <h4>${trabalho.titulo}</h4>
          <p>${trabalho.descricao}</p>
          <span class="trabalho-ano">${trabalho.ano}</span>
        </div>
      `;
    });

    conteudo.innerHTML = html;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Configurar event listeners para fechar o modal
    configurarEventListenersModal();
  }
}

// Função para fechar modal de trabalhos
function fecharModalTrabalhos() {
  const modal = document.getElementById('modal-trabalhos');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

// Função para configurar event listeners do modal de trabalhos
function configurarEventListenersModal() {
  const modal = document.getElementById('modal-trabalhos');

  if (modal) {
    // Remove event listeners anteriores para evitar duplicatas
    const novoModal = modal.cloneNode(true);
    modal.parentNode.replaceChild(novoModal, modal);

    const modalAtualizado = document.getElementById('modal-trabalhos');
    const closeBtn = modalAtualizado.querySelector('.modal-close');

    // Event listener para o botão X
    if (closeBtn) {
      closeBtn.addEventListener('click', fecharModalTrabalhos);
    }

    // Fechar ao clicar fora do conteúdo
    modalAtualizado.addEventListener('click', (e) => {
      if (e.target === modalAtualizado) {
        fecharModalTrabalhos();
      }
    });

    // Fechar com ESC
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalAtualizado.classList.contains('show')) {
        fecharModalTrabalhos();
        document.removeEventListener('keydown', handleEscape);
      }
    };

    document.addEventListener('keydown', handleEscape);
  }
}

// Dados dos fotógrafos organizados por obra e índice
const dadosCarrosseis = {
  'obra-1': {
    0: { fotografo: "Alessandra Novaes", descricao: " " },
    1: { fotografo: "Alessandra Novaes", descricao: "" },
    2: { fotografo: "Alessandra Novaes", descricao: "" },
    3: { fotografo: "Alessandra Novaes", descricao: "" },
    4: { fotografo: "Alessandra Novaes", descricao: "" }
  },
  'obra-2': {
    0: { fotografo: "Gui Lima", descricao: "" },
    1: { fotografo: "Gui Lima", descricao: "" },
    2: { fotografo: "Gui Lima", descricao: "" },
    3: { fotografo: "Gui Lima", descricao: "" }
  },
  'obra-3': {
    0: { fotografo: "Gui Lima", descricao: "" },
    1: { fotografo: "Gui Lima", descricao: "" },
    2: { fotografo: "Gui Lima", descricao: "" }
  },
  'obra-4': {
    0: { fotografo: "Giovanna Baraldi", descricao: "" },
    1: { fotografo: "Giovanna Baraldi", descricao: "" },
    2: { fotografo: "Giovanna Baraldi", descricao: "" },
    3: { fotografo: "Giovanna Baraldi", descricao: "" },
    4: { fotografo: "Giovanna Baraldi", descricao: "" },
    5: { fotografo: "Giovanna Baraldi", descricao: "" },
    6: { fotografo: "Giovanna Baraldi", descricao: "" },
    7: { fotografo: "Giovanna Baraldi", descricao: "" },
    8: { fotografo: "Giovanna Baraldi", descricao: "" }
  },
  'obra-5': {
    0: { fotografo: "Gui Lima", descricao: "" },
    1: { fotografo: "Gui Lima", descricao: "" },
    2: { fotografo: "Gui Lima", descricao: "" },
    3: { fotografo: "Gui Lima", descricao: "" },
    4: { fotografo: "Gui Lima", descricao: "" },
    5: { fotografo: "Gui Lima", descricao: "" },
    6: { fotografo: "Gui Lima", descricao: "" }
  },
  'obra-6': {
    0: { fotografo: "Não informado", descricao: "" },
    1: { fotografo: "Não informado", descricao: "" },
    2: { fotografo: "Não informado", descricao: "" },
    3: { fotografo: "Não informado", descricao: "" }
  },
  'obra-7': {
    0: { fotografo: "Maduh", descricao: "" },
    1: { fotografo: "Maduh", descricao: "" },
    2: { fotografo: "Maduh", descricao: "" },
    3: { fotografo: "Maduh", descricao: "" },
    4: { fotografo: "Maduh", descricao: "" },
    5: { fotografo: "Maduh", descricao: "" },
    6: { fotografo: "Maduh", descricao: "" },
    7: { fotografo: "Felipe Julio", descricao: "" },
    8: { fotografo: "Renan Perobelli", descricao: "" }
  },
  'obra-8': {
    0: { fotografo: "Flávia Regina", descricao: "" },
    1: { fotografo: "Flávia Regina", descricao: "" },
    2: { fotografo: "Flávia Regina", descricao: "" },
    3: { fotografo: "Flávia Regina", descricao: "" }
  },
  'obra-9': {
    0: { fotografo: "Beatriz Vieira", descricao: "" },
    1: { fotografo: "Beatriz Vieira", descricao: "" },
    2: { fotografo: "Beatriz Vieira", descricao: "" },
    3: { fotografo: "Julia Carol", descricao: "" },
    4: { fotografo: "Julia Carol", descricao: "" },
    5: { fotografo: "Julia Carol", descricao: "" }
  }
};

// Função para inicializar cliques nas imagens do carrossel
function inicializarClicksCarrossel() {
  const imagensCarrossel = document.querySelectorAll('.carrossel-img');

  imagensCarrossel.forEach(img => {
    // Remove listeners anteriores
    img.removeEventListener('click', handleImagemCarrossel);

    // Adiciona novo event listener
    img.addEventListener('click', handleImagemCarrossel);
  });

  // Garante que o modal existe
  garantirModalImagem();
}

// Função para lidar com clique nas imagens do carrossel
function handleImagemCarrossel(event) {
  const img = event.currentTarget || event.target.closest('.carrossel-img') || event.target;
  const obra = img.getAttribute('data-obra');
  const index = img.getAttribute('data-index');

  if (obra && index && dadosCarrosseis[obra] && dadosCarrosseis[obra][index]) {
    const dados = dadosCarrosseis[obra][index];
    mostrarImagemModalComCreditos(img.src, img.alt, dados.fotografo, dados.descricao, img);
  } else {
    mostrarImagemModal(img.src, img.alt);
  }
}


// Função para garantir que o modal existe
function garantirModalImagem() {
  let modal = document.getElementById('modal-imagem');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-imagem';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <img src="" alt="">
      </div>
    `;
    document.body.appendChild(modal);

    // Configurar event listeners para fechar
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => fecharModalImagem());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        fecharModalImagem();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        fecharModalImagem();
      }
    });
  }
}

// Função para mostrar imagem no modal
function mostrarImagemModal(src, alt) {
  const modal = document.getElementById('modal-imagem');
  const modalImg = modal.querySelector('img');

  if (modal && modalImg) {
    modalImg.src = src;
    modalImg.alt = alt;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// Função para mostrar imagem no modal com créditos
function mostrarImagemModalComCreditos(src, alt, fotografo, descricao, imgAtual = null) {
  // Remove modal existente se houver
  const modalExistente = document.getElementById('modal-imagem-creditos');
  if (modalExistente) {
    modalExistente.remove();
  }

  // Encontrar todas as imagens do carrossel atual
  const carrossel = imgAtual ? imgAtual.closest('.carrossel-container') : null;
  const todasImagens = carrossel ? Array.from(carrossel.querySelectorAll('.carrossel-img')) : [];
  let indiceAtual = -1;

  // Encontrar o índice da imagem atual usando data-index
  if (todasImagens.length > 0 && imgAtual) {
    const obraAtual = imgAtual.getAttribute('data-obra');
    const indexAtual = imgAtual.getAttribute('data-index');

    todasImagens.forEach((img, index) => {
      const obra = img.getAttribute('data-obra');
      const idx = img.getAttribute('data-index');
      if (obra === obraAtual && idx === indexAtual) {
        indiceAtual = index;
      }
    });

    // Se não encontrou o índice, usa o primeiro como fallback
    if (indiceAtual === -1) {
      indiceAtual = 0;
    }
  }

  // Criar modal com créditos e navegação
  const modal = document.createElement('div');
  modal.id = 'modal-imagem-creditos';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content-imagem">
      <button class="modal-close">&times;</button>
      ${todasImagens.length > 1 ? '<button class="modal-nav-btn modal-prev">❮</button>' : ''}
      ${todasImagens.length > 1 ? '<button class="modal-nav-btn modal-next">❯</button>' : ''}
      <div class="modal-imagem-container">
        <div class="modal-loading" style="display: none;">Carregando...</div>
        <img src="${src}" alt="${alt}">
        <div class="modal-creditos">
          <h4>${descricao}</h4>
          <p>Fotografia: ${fotografo}</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.modal-close');
  const prevBtn = modal.querySelector('.modal-prev');
  const nextBtn = modal.querySelector('.modal-next');
  const modalImg = modal.querySelector('img');
  const modalTitulo = modal.querySelector('.modal-creditos h4');
  const modalFotografo = modal.querySelector('.modal-creditos p');
  const loadingIndicator = modal.querySelector('.modal-loading');

  // Cache de imagens pré-carregadas
  const imageCache = new Map();

  // Pré-carregar apenas imagens adjacentes (otimizado)
  function precarregarImagensAdjacentes(indiceAtual) {
    // Carrega apenas 2 imagens antes e 2 depois
    const indicesToPreload = [];
    for (let i = -2; i <= 2; i++) {
      if (i !== 0) {
        const idx = (indiceAtual + i + todasImagens.length) % todasImagens.length;
        indicesToPreload.push(idx);
      }
    }

    indicesToPreload.forEach(idx => {
      const img = todasImagens[idx];
      if (img && !imageCache.has(idx)) {
        const imgSrc = img.src || img.getAttribute('data-src');
        if (imgSrc) {
          const preloadImg = new Image();
          preloadImg.src = imgSrc;
          imageCache.set(idx, preloadImg);
        }
      }
    });
  }

  // Pré-carregar imagem atual e adjacentes imediatas
  function precarregarImagemAtual(indice) {
    const img = todasImagens[indice];
    if (img && !imageCache.has(indice)) {
      const imgSrc = img.src || img.getAttribute('data-src');
      if (imgSrc) {
        const preloadImg = new Image();
        preloadImg.src = imgSrc;
        imageCache.set(indice, preloadImg);
      }
    }
    
    // Pré-carregar adjacentes em background
    setTimeout(() => precarregarImagensAdjacentes(indice), 100);
  }

  function atualizarModal(novoIndice) {
    if (novoIndice < 0 || novoIndice >= todasImagens.length) return;

    const novaImg = todasImagens[novoIndice];
    const obra = novaImg.getAttribute('data-obra');
    const index = novaImg.getAttribute('data-index');
    const imgSrc = novaImg.src || novaImg.getAttribute('data-src');

    // Se for a mesma imagem, não faz nada
    if (modalImg.src === imgSrc) {
      indiceAtual = novoIndice;
      return;
    }

    // Atualiza informações dos créditos imediatamente
    if (obra && index && dadosCarrosseis[obra] && dadosCarrosseis[obra][index]) {
      const dados = dadosCarrosseis[obra][index];
      modalTitulo.textContent = dados.descricao;
      modalFotografo.textContent = `Fotografia: ${dados.fotografo}`;
    } else {
      modalTitulo.textContent = '';
      modalFotografo.textContent = '';
    }

    // Pré-carregar a imagem antes de mostrar
    const imagemPreCarregada = imageCache.get(novoIndice);
    
    if (imagemPreCarregada && imagemPreCarregada.complete) {
      // Imagem já está carregada, troca instantaneamente
      modalImg.style.transition = 'opacity 0.1s ease';
      modalImg.style.opacity = '0';
      
      setTimeout(() => {
        modalImg.src = imgSrc;
        modalImg.alt = novaImg.alt || '';
        indiceAtual = novoIndice;
        modalImg.style.opacity = '1';
        
        // Pré-carregar próximas imagens em background
        precarregarImagensAdjacentes(novoIndice);
      }, 100);
    } else {
      // Imagem não está no cache, mostra loading e carrega
      loadingIndicator.style.display = 'block';
      modalImg.style.opacity = '0.5';
      
      const tempImg = new Image();
      tempImg.onload = () => {
        imageCache.set(novoIndice, tempImg);
        modalImg.src = imgSrc;
        modalImg.alt = novaImg.alt || '';
        indiceAtual = novoIndice;
        modalImg.style.transition = 'opacity 0.15s ease';
        modalImg.style.opacity = '1';
        loadingIndicator.style.display = 'none';
        
        // Pré-carregar próximas imagens em background
        precarregarImagensAdjacentes(novoIndice);
      };
      tempImg.onerror = () => {
        loadingIndicator.textContent = 'Erro ao carregar';
        setTimeout(() => {
          loadingIndicator.style.display = 'none';
          modalImg.style.opacity = '1';
        }, 1500);
      };
      tempImg.src = imgSrc;
    }
  }

  // Pré-carregar apenas imagem atual e adjacentes ao abrir modal
  precarregarImagemAtual(indiceAtual);

  function fecharModalCreditos() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    setTimeout(() => modal.remove(), 300);
  }

  // Event listeners
  closeBtn.addEventListener('click', fecharModalCreditos);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const novoIndice = indiceAtual > 0 ? indiceAtual - 1 : todasImagens.length - 1;
      atualizarModal(novoIndice);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const novoIndice = indiceAtual < todasImagens.length - 1 ? indiceAtual + 1 : 0;
      atualizarModal(novoIndice);
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      fecharModalCreditos();
    }
  });

  document.addEventListener('keydown', function handleKeyboard(e) {
    if (!modal.classList.contains('show')) return;

    if (e.key === 'Escape') {
      fecharModalCreditos();
      document.removeEventListener('keydown', handleKeyboard);
    } else if (e.key === 'ArrowLeft' && todasImagens.length > 1) {
      const novoIndice = indiceAtual > 0 ? indiceAtual - 1 : todasImagens.length - 1;
      atualizarModal(novoIndice);
    } else if (e.key === 'ArrowRight' && todasImagens.length > 1) {
      const novoIndice = indiceAtual < todasImagens.length - 1 ? indiceAtual + 1 : 0;
      atualizarModal(novoIndice);
    }
  });

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Pré-carregar imagens adjacentes após mostrar a atual
  if (todasImagens.length > 1 && indiceAtual >= 0) {
    setTimeout(() => {
      const indicesToPreload = [];
      for (let i = -2; i <= 2; i++) {
        if (i !== 0) {
          const idx = (indiceAtual + i + todasImagens.length) % todasImagens.length;
          indicesToPreload.push(idx);
        }
      }

      indicesToPreload.forEach(idx => {
        const img = todasImagens[idx];
        if (img) {
          const src = img.src || img.getAttribute('data-src');
          if (src) {
            const preloadImg = new Image();
            preloadImg.src = src;
          }
        }
      });
    }, 100);
  }
}

// Função para fechar modal de imagem
function fecharModalImagem() {
  const modal = document.getElementById('modal-imagem');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}