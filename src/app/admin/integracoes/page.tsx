"use client";

import { useState } from "react";

export default function IntegracoesPage() {
  const [activeTab, setActiveTab] = useState<"pix" | "cartao" | "email" | "whatsapp">("pix");

  const integrations = {
    pix: {
      title: "Integração Pix",
      description: "Configure o Pix para receber pagamentos instantâneos com 5% de desconto.",
      steps: [
        {
          title: "1. Crie uma conta Pix",
          content: "Acesse o banco de sua preferência e cadastre uma chave Pix (CPF, e-mail, telefone ou chave aleatória).",
        },
        {
          title: "2. Obtenha a chave Pix",
          content: "Copie a chave Pix que você deseja usar para receber pagamentos da loja.",
        },
        {
          title: "3. Configure no sistema",
          content: "No painel de administração, vá em Configurações > Pagamentos e insira sua chave Pix.",
        },
        {
          title: "4. Teste a integração",
          content: "Faça um pedido de teste usando o método Pix e verifique se o QR Code é gerado corretamente.",
        },
      ],
      notes: "O Pix oferece desconto automático de 5% no valor total do pedido como incentivo ao pagamento instantâneo.",
    },
    cartao: {
      title: "Integração Cartão de Crédito",
      description: "Configure um gateway de pagamento para aceitar cartões de crédito e débito.",
      steps: [
        {
          title: "1. Escolha um gateway",
          content: "Opções populares: Stripe, Mercado Pago, PagSeguro, Iugu, Pagar.me. Cada um tem taxas e recursos diferentes.",
        },
        {
          title: "2. Crie uma conta no gateway",
          content: "Cadastre-se no gateway escolhido e complete a verificação de identidade e cadastro da empresa.",
        },
        {
          title: "3. Obtenha as chaves de API",
          content: "No painel do gateway, gere as chaves de API (Public Key e Secret Key) para ambiente de teste e produção.",
        },
        {
          title: "4. Configure no sistema",
          content: "No painel de administração, vá em Configurações > Pagamentos > Cartão e insira as chaves de API.",
        },
        {
          title: "5. Configure webhooks (opcional)",
          content: "Configure webhooks para receber notificações automáticas sobre status de pagamentos.",
        },
        {
          title: "6. Teste em sandbox",
          content: "Use o ambiente de teste do gateway para simular pagamentos antes de ir para produção.",
        },
      ],
      notes: "Recomendamos começar com Stripe ou Mercado Pago pela facilidade de integração e documentação completa.",
    },
    email: {
      title: "Integração E-mail Transacional",
      description: "Configure envio automático de e-mails de confirmação de pedido, atualizações e marketing.",
      steps: [
        {
          title: "1. Escolha um serviço de e-mail",
          content: "Opções: SendGrid, Mailgun, Amazon SES, Brevo (antigo Sendinblue), Resend.",
        },
        {
          title: "2. Crie uma conta",
          content: "Cadastre-se no serviço escolhido e verifique seu domínio de e-mail.",
        },
        {
          title: "3. Configure DNS",
          content: "Adicione os registros SPF, DKIM e DMARC fornecidos pelo serviço nas configurações DNS do seu domínio.",
        },
        {
          title: "4. Obtenha a API Key",
          content: "Gere uma API Key no painel do serviço de e-mail.",
        },
        {
          title: "5. Configure no sistema",
          content: "No painel de administração, vá em Configurações > E-mail e insira a API Key e configure o remetente.",
        },
        {
          title: "6. Crie os templates",
          content: "Configure os templates de e-mail para confirmação de pedido, atualização de status e recuperação de senha.",
        },
      ],
      notes: "Use um domínio próprio (ex: contato@kromalab.com) para melhor deliverabilidade e profissionalismo.",
    },
    whatsapp: {
      title: "Integração WhatsApp Business",
      description: "Configure notificações automáticas via WhatsApp para atualizações de pedidos.",
      steps: [
        {
          title: "1. Baixe o WhatsApp Business",
          content: "Instale o aplicativo WhatsApp Business no seu smartphone.",
        },
        {
          title: "2. Crie uma conta Business",
          content: "Registre o número de telefone da loja como conta Business.",
        },
        {
          title: "3. Configure o catálogo",
          content: "Adicione seus produtos ao catálogo do WhatsApp Business.",
        },
        {
          title: "4. Use a API do WhatsApp (opcional)",
          content: "Para automação avançada, use a API do WhatsApp Business através de provedores como Twilio, MessageBird ou Z-API.",
        },
        {
          title: "5. Configure respostas rápidas",
          content: "Crie respostas rápidas para perguntas frequentes sobre prazos, tamanhos e formas de pagamento.",
        },
        {
          title: "6. Configure no sistema",
          content: "No painel de administração, vá em Configurações > WhatsApp e insira o número para notificações.",
        },
      ],
      notes: "Para automação completa, considere usar a API do WhatsApp através de um provedor terceirizado.",
    },
  };

  const currentIntegration = integrations[activeTab];

  return (
    <div>
      <h1 className="text-3xl font-black uppercase mb-8">Integrações</h1>

      <div className="flex gap-2 mb-6 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("pix")}
          className={`px-4 py-3 text-sm font-black uppercase border-b-2 transition-colors ${
            activeTab === "pix"
              ? "border-black text-black"
              : "border-transparent text-neutral-600 hover:text-black"
          }`}
        >
          Pix
        </button>
        <button
          onClick={() => setActiveTab("cartao")}
          className={`px-4 py-3 text-sm font-black uppercase border-b-2 transition-colors ${
            activeTab === "cartao"
              ? "border-black text-black"
              : "border-transparent text-neutral-600 hover:text-black"
          }`}
        >
          Cartão
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-3 text-sm font-black uppercase border-b-2 transition-colors ${
            activeTab === "email"
              ? "border-black text-black"
              : "border-transparent text-neutral-600 hover:text-black"
          }`}
        >
          E-mail
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`px-4 py-3 text-sm font-black uppercase border-b-2 transition-colors ${
            activeTab === "whatsapp"
              ? "border-black text-black"
              : "border-transparent text-neutral-600 hover:text-black"
          }`}
        >
          WhatsApp
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-black uppercase mb-2">{currentIntegration.title}</h2>
          <p className="text-sm font-medium leading-6 text-neutral-600">{currentIntegration.description}</p>
        </div>

        <div className="space-y-6">
          {currentIntegration.steps.map((step, index) => (
            <div key={index} className="border-l-4 border-black pl-4">
              <h3 className="text-lg font-black uppercase mb-2">{step.title}</h3>
              <p className="text-sm font-medium leading-6 text-neutral-600">{step.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-[var(--accent-soft)] rounded-lg">
          <p className="text-sm font-black uppercase text-[var(--accent)] mb-1">Nota Importante</p>
          <p className="text-sm font-medium leading-6 text-neutral-700">{currentIntegration.notes}</p>
        </div>

        <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
          <p className="text-sm font-black uppercase mb-2">Status da Integração</p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <p className="text-sm font-medium text-neutral-700">Pendente de configuração</p>
          </div>
          <button className="mt-4 px-6 py-3 bg-black text-white rounded-lg text-sm font-black uppercase hover:bg-neutral-800">
            Configurar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
