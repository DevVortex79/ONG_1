// ================================================
// spa-app.js - Aplicação Principal
// Instituto Caminhos do Amanhã
// ================================================

import { navigateTo, router } from "./spa-router.js";
import { pages } from "./spa-pages.js";

const appContent = document.getElementById("app-content");
const loader = document.getElementById("page-loader");

// ============================================
// SISTEMA DE ALERTAS
// ============================================

function showAlert(msg, type = "sucesso") {
  const old = document.querySelector(".alerta");
  if (old) old.remove();
  
  const div = document.createElement("div");
  div.className = `alerta ${type}`;
  div.innerHTML = `<span class="badge">${type === "sucesso" ? "✓ Sucesso" : "✗ Erro"}</span>${msg}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// ============================================
// VALIDADORES DE FORMULÁRIO
// ============================================

const validadores = {
  nome: {
    validar: (valor) => {
      if (!valor || valor.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) return "Nome deve conter apenas letras";
      if (valor.trim().split(/\s+/).length < 2) return "Digite nome e sobrenome";
      return null;
    }
  },
  
  cpf: {
    validar: (valor) => {
      const cpfLimpo = valor.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) return "CPF deve ter 11 dígitos";
      if (/^(\d)\1{10}$/.test(cpfLimpo)) return "CPF inválido";
      
      let soma = 0;
      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
      }
      let resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpfLimpo.substring(9, 10))) return "CPF inválido";
      
      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpfLimpo.substring(10, 11))) return "CPF inválido";
      
      return null;
    },
    formatar: (valor) => {
      const numeros = valor.replace(/\D/g, '');
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  },
  
  data: {
    validar: (valor) => {
      if (!valor) return "Data de nascimento é obrigatória";
      
      const dataNasc = new Date(valor);
      const hoje = new Date();
      
      if (dataNasc > hoje) return "Data não pode ser futura";
      
      let idade = hoje.getFullYear() - dataNasc.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNasc = dataNasc.getMonth();
      
      if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < dataNasc.getDate())) {
        idade--;
      }
      
      if (idade < 16) return "Você deve ter pelo menos 16 anos";
      if (idade > 100) return "Verifique a data informada";
      
      return null;
    }
  },
  
  email: {
    validar: (valor) => {
      if (!valor) return "E-mail é obrigatório";
      
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(valor)) return "E-mail inválido";
      
      const partes = valor.split('@');
      if (partes[0].length < 3) return "E-mail muito curto";
      
      return null;
    }
  },
  
  telefone: {
    validar: (valor) => {
      const numeros = valor.replace(/\D/g, '');
      
      if (numeros.length < 10 || numeros.length > 11) {
        return "Telefone deve ter 10 ou 11 dígitos";
      }
      
      if (numeros.length === 11 && numeros[2] !== '9') {
        return "Celular deve começar com 9";
      }
      
      const ddd = parseInt(numeros.substring(0, 2));
      if (ddd < 11 || ddd > 99) return "DDD inválido";
      
      return null;
    },
    formatar: (valor) => {
      const numeros = valor.replace(/\D/g, '');
      if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return valor;
    }
  },
  
  endereco: {
    validar: (valor) => {
      if (!valor || valor.trim().length < 5) {
        return "Endereço deve ter pelo menos 5 caracteres";
      }
      if (!/\d/.test(valor)) return "Endereço deve conter número";
      return null;
    }
  },
  
  cep: {
    validar: (valor) => {
      const numeros = valor.replace(/\D/g, '');
      if (numeros.length !== 8) return "CEP deve ter 8 dígitos";
      if (/^0{8}$/.test(numeros)) return "CEP inválido";
      return null;
    },
    formatar: (valor) => {
      const numeros = valor.replace(/\D/g, '');
      return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
  },
  
  senha: {
    validar: (valor) => {
      if (!valor || valor.length < 6) {
        return "Senha deve ter pelo menos 6 caracteres";
      }
      if (!/[A-Z]/.test(valor)) {
        return "Senha deve ter pelo menos 1 letra maiúscula";
      }
      if (!/[a-z]/.test(valor)) {
        return "Senha deve ter pelo menos 1 letra minúscula";
      }
      if (!/[0-9]/.test(valor)) {
        return "Senha deve ter pelo menos 1 número";
      }
      return null;
    }
  }
};

// ============================================
// FUNÇÕES DE FEEDBACK VISUAL
// ============================================

function mostrarErro(campo, mensagem) {
  const erroExistente = campo.parentElement.querySelector('.erro-validacao');
  if (erroExistente) erroExistente.remove();
  
  campo.classList.add('campo-invalido');
  campo.classList.remove('campo-valido');
  
  if (mensagem) {
    const divErro = document.createElement('div');
    divErro.className = 'erro-validacao';
    divErro.textContent = mensagem;
    campo.parentElement.appendChild(divErro);
  }
}

function mostrarSucesso(campo) {
  const erroExistente = campo.parentElement.querySelector('.erro-validacao');
  if (erroExistente) erroExistente.remove();
  
  campo.classList.remove('campo-invalido');
  campo.classList.add('campo-valido');
}

function validarCampo(campo) {
  const nome = campo.id;
  const valor = campo.value;
  
  if (!validadores[nome]) return true;
  
  const erro = validadores[nome].validar(valor);
  
  if (erro) {
    mostrarErro(campo, erro);
    return false;
  } else {
    mostrarSucesso(campo);
    return true;
  }
}

function aplicarMascara(campo) {
  const nome = campo.id;
  
  if (validadores[nome] && validadores[nome].formatar) {
    const valorFormatado = validadores[nome].formatar(campo.value);
    if (valorFormatado !== campo.value) {
      campo.value = valorFormatado;
    }
  }
}

// ============================================
// MANIPULADOR DO FORMULÁRIO DE CADASTRO
// ============================================

function handleCadastroForm() {
  const form = document.querySelector("form");
  if (!form) return;
  
  const campos = ['nome', 'cpf', 'data', 'email', 'telefone', 'endereco', 'cep', 'senha'];
  
  campos.forEach(nomeCampo => {
    const campo = document.getElementById(nomeCampo);
    if (!campo) return;
    
    campo.addEventListener('blur', () => {
      if (campo.value) validarCampo(campo);
    });
    
    campo.addEventListener('input', () => {
      if (campo.classList.contains('campo-invalido')) {
        campo.classList.remove('campo-invalido');
        const erroExistente = campo.parentElement.querySelector('.erro-validacao');
        if (erroExistente) erroExistente.remove();
      }
      aplicarMascara(campo);
    });
  });
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (!document.getElementById("termos").checked) {
      showAlert("Você deve aceitar os termos de uso!", "erro");
      return;
    }
    
    let formularioValido = true;
    let primeiroErro = null;
    
    campos.forEach(nomeCampo => {
      const campo = document.getElementById(nomeCampo);
      if (campo) {
        const valido = validarCampo(campo);
        if (!valido) {
          formularioValido = false;
          if (!primeiroErro) primeiroErro = campo;
        }
      }
    });
    
    if (!formularioValido) {
      showAlert("Por favor, corrija os erros no formulário!", "erro");
      if (primeiroErro) {
        primeiroErro.focus();
        primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    showAlert("Cadastro realizado com sucesso!", "sucesso");
    
    setTimeout(() => {
      form.reset();
      campos.forEach(nomeCampo => {
        const campo = document.getElementById(nomeCampo);
        if (campo) {
          campo.classList.remove('campo-valido', 'campo-invalido');
          const erro = campo.parentElement.querySelector('.erro-validacao');
          if (erro) erro.remove();
        }
      });
    }, 1500);
  });
}

// ============================================
// EVENT LISTENERS PRINCIPAIS
// ============================================

window.addEventListener("routechange", e => {
  loader.classList.add("show");
  
  setTimeout(() => {
    appContent.innerHTML = pages[e.detail];
    loader.classList.remove("show");
    appContent.setAttribute("tabindex", "-1");
    appContent.focus();
    
    if (e.detail === "cadastro") handleCadastroForm();
  }, 400);
});

document.addEventListener("click", e => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute("href"));
  }
});

window.addEventListener("popstate", router);
document.addEventListener("DOMContentLoaded", router);