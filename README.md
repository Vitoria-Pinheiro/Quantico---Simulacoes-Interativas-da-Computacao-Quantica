# ⚛️ Computação Quântica com Íons Aprisionados

> Simulações interativas e conceitos fundamentais de computação quântica e física atômica diretamente no navegador.

Uma aplicação web estática, leve e intuitiva construída com JavaScript puro e Canvas API para visualizar o funcionamento de um computador quântico de íons presos (Trapped Ions).

---

##  Demonstrações Interativas

O projeto abrange visualizações práticas dos seguintes conceitos:
- **Crescimento Exponencial:** Escalonamento da memória do vetor de estados quânticos.
- **Qubit & Superposição:** Manipulação de probabilidade de estados $\vert{}0\rangle$ e $\vert{}1\rangle$.
- **Emaranhamento:** Par de Bell e cálculo de entropia de emaranhamento.
- **Armadilha de Paul:** Simulação de confinamento dinâmico via integração de Runge-Kutta.
- **Resfriamento Doppler:** Efeito da dessintonia de laser na distribuição de velocidade atômica.
- **Oscilações de Rabi & Esfera de Bloch:** Rotações interativas de estado e aplicação de portas quânticas ($X, Y, Z, H$).
- **Modos de Fônons:** Decomposição dos modos coletivos de vibração na cadeia de íons.
- **Arquitetura QCCD:** Movimentação e transporte de íons em eletrodos segmentados.

---

##  Estrutura do Projeto

O projeto é 100% estático e não possui dependências externas ou etapas de compilação:

```text
├── index.html   # Estrutura HTML5 e conteúdo explicativo
├── style.css    # Estilização, variáveis de cores e responsividade
├── app.js       # Motores de simulação quântica e renderização no Canvas
└── vercel.json  # Configuração de rotas para implantação na Vercel
