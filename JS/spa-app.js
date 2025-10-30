import { navigateTo, router } from "./spa-router.js";
import { pages } from "./spa-pages.js";

const appContent = document.getElementById("app-content");
const loader = document.getElementById("page-loader");

function showAlert(msg, type="sucesso") {
  const old = document.querySelector(".alerta"); 
  if(old) old.remove();
  const div = document.createElement("div"); 
  div.className=`alerta ${type}`;
  div.innerHTML=`<span class="badge">${type==="sucesso"?"✓ Sucesso":"✗ Erro"}</span>${msg}`;
  document.body.appendChild(div); 
  setTimeout(()=>div.remove(),3000);
}

// Sistema de validação de formulário
const validadores = {
  nome: {
    validar: (valor) => {
      if (!valor || valor.trim().length < 3) {
        return "Nome deve ter pelo menos 3 caracteres";
      }
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) {
        return "Nome deve conter apenas letras";
      }
      const palavras = valor.trim().split(/\s+/);
      if (palavras.length < 2) {
        return "Digite nome e sobrenome";
      }
      return null;
    }
  },
  
  cpf: {
    validar: (valor) => {
      const cpfLimpo = valor.replace(/\D/g, '');
      
      if (cpfLimpo.length !== 11) {
        return "CPF deve ter 11 dígitos";
      }
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpfLimpo)) {
        return "CPF inválido";
      }
      
      // Validação do dígito verificador
      let soma = 0;
      let resto;
      
      for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpfLimpo.substring(i-1, i)) * (11 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
        return "CPF inválido";
      }
      
      soma = 0;
      for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpfLimpo.substring(i-1, i)) * (12 - i);
      }
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
        return "CPF inválido";
      }
      
      return null;
    },
    formatar: (valor) => {
      const numeros = valor.replace(/\D/g, '');
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  },
  
  data: {
    validar: (valor) => {
      if (!valor) {
        return "Data de nascimento é obrigatória";
      }
      
      const dataNasc = new Date(valor);
      const hoje = new Date();
      const idade = hoje.getFullYear() - dataNasc.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNasc = dataNasc.getMonth();
      
      if (dataNasc > hoje) {
        return "Data não pode ser futura";
      }
      
      let idadeReal = idade;
      if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < dataNasc.getDate())) {
        idadeReal--;
      }
      
      if (idadeReal < 16) {
        return "Você deve ter pelo menos 16 anos";
      }
      
      if (idadeReal > 100) {
        return "Verifique a data informada";
      }
      
      return null;
    }
  },
  
  email: {
    validar: (valor) => {
      if (!valor) {
        return "E-mail é obrigatório";
      }
      
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(valor)) {
        return "E-mail inválido";
      }
      
      const partes = valor.split('@');
      if (partes[0].length < 3) {
        return "E-mail muito curto";
      }
      
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
      
      // Verifica DDD válido (11 a 99)
      const ddd = parseInt(numeros.substring(0, 2));
      if (ddd < 11 || ddd > 99) {
        return "DDD inválido";
      }
      
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
      
      if (!/\d/.test(valor)) {
        return "Endereço deve conter número";
      }
      
      return null;
    }
  },
  
  cep: {
    validar: (valor) => {
      const numeros = valor.replace(/\D/g, '');
      
      if (numeros.length !== 8) {
        return "CEP deve ter 8 dígitos";
      }
      
      if (/^0{8}$/.test(numeros)) {
        return "CEP inválido";
      }
      
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

function mostrarErro(campo, mensagem) {
  // Remove erro anterior
  const erroExistente = campo.parentElement.querySelector('.erro-validacao');
  if (erroExistente) {
    erroExistente.remove();
  }
  
  // Adiciona estilo de erro
  campo.classList.add('campo-invalido');
  campo.classList.remove('campo-valido');
  
  // Cria mensagem de erro
  if (mensagem) {
    const divErro = document.createElement('div');
    divErro.className = 'erro-validacao';
    divErro.textContent = mensagem;
    campo.parentElement.appendChild(divErro);
  }
}

function mostrarSucesso(campo) {
  // Remove erro anterior
  const erroExistente = campo.parentElement.querySelector('.erro-validacao');
  if (erroExistente) {
    erroExistente.remove();
  }
  
  // Adiciona estilo de sucesso
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

function handleCadastroForm() {
  const form = document.querySelector("form"); 
  if (!form) return;
  
  // Campos do formulário
  const campos = ['nome', 'cpf', 'data', 'email', 'telefone', 'endereco', 'cep', 'senha'];
  
  // Adiciona validação em tempo real
  campos.forEach(nomeCampo => {
    const campo = document.getElementById(nomeCampo);
    if (!campo) return;
    
    // Validação ao sair do campo (blur)
    campo.addEventListener('blur', () => {
      if (campo.value) {
        validarCampo(campo);
      }
    });
    
    // Validação enquanto digita (input) - apenas para alguns campos
    campo.addEventListener('input', () => {
      // Remove classe de erro enquanto digita
      if (campo.classList.contains('campo-invalido')) {
        campo.classList.remove('campo-invalido');
        const erroExistente = campo.parentElement.querySelector('.erro-validacao');
        if (erroExistente) {
          erroExistente.remove();
        }
      }
      
      // Aplica máscaras
      aplicarMascara(campo);
    });
  });
  
  // Validação ao submeter
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Verifica termos de uso
    if (!document.getElementById("termos").checked) {
      showAlert("Você deve aceitar os termos de uso!", "erro");
      return;
    }
    
    // Valida todos os campos
    let formularioValido = true;
    let primeiroErro = null;
    
    campos.forEach(nomeCampo => {
      const campo = document.getElementById(nomeCampo);
      if (campo) {
        const valido = validarCampo(campo);
        if (!valido) {
          formularioValido = false;
          if (!primeiroErro) {
            primeiroErro = campo;
          }
        }
      }
    });
    
    if (!formularioValido) {
      showAlert("Por favor, corrija os erros no formulário!", "erro");
      // Foca no primeiro campo com erro
      if (primeiroErro) {
        primeiroErro.focus();
        primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Se tudo estiver válido, envia o formulário
    showAlert("Cadastro realizado com sucesso!", "sucesso");
    
    // Aguarda um pouco antes de limpar para o usuário ver a mensagem
    setTimeout(() => {
      form.reset();
      // Remove todas as classes de validação
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

window.addEventListener("routechange", e => {
  loader.classList.add("show");
  setTimeout(() => {
    appContent.innerHTML = pages[e.detail];
    loader.classList.remove("show");

    // Mover foco para o conteúdo principal
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

const btnContraste = document.createElement('button');
btnContraste.textContent = "Alto contraste";
btnContraste.className = "joinBtn";
btnContraste.style.position = "fixed";
btnContraste.style.bottom = "20px";
btnContraste.style.right = "20px";
btnContraste.setAttribute("aria-pressed", "false");
btnContraste.onclick = () => {
  const ativo = document.body.classList.toggle("high-contrast");
  btnContraste.setAttribute("aria-pressed", ativo);
  localStorage.setItem("highContrast", ativo);
};
document.body.appendChild(btnContraste);

if (localStorage.getItem("highContrast") === "true") {
  document.body.classList.add("high-contrast");
}
