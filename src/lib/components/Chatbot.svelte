<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  const renderer = new marked.Renderer();
  const originalLinkRenderer = renderer.link.bind(renderer);
  renderer.link = (href, title, text) => {
    const link = originalLinkRenderer(href, title, text);
    return link.replace('<a ', '<a class="markdown-content-link" ');
  };

  // Override the "link" token specifically for autolinks
  renderer.autolink = (href, type) => {
    // type could be 'url' or 'email'
    const linkHtml = `<a class="markdown-content-link" href="${href}">${href}</a>`;
    return linkHtml
  };

  marked.setOptions({ renderer, gfm: true });
  
  let messages = [];
  let ws;
  let chatHistory = [];
  let currentUserPrompt = '';
  let accumulatedBotResponse = '';
  let prompt = '';
  let language = 'EN';
  let messagesDiv;
  let currentBotMessageDiv;
  const WS_URL = import.meta.env.VITE_WS_URL;

  onMount(() => {
    connectWebSocket();
    return () => {
      if (ws) ws.close();
    };
  });

  function connectWebSocket() {
    ws = new WebSocket(WS_URL)
    ws.onopen = () => {
      console.log('WebSocket connection established.');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'start' || data.type === 'content_block_start') {
          accumulatedBotResponse = '';
          messages = [...messages, {
            type: 'bot',
            content: '<strong>Horizon:</strong> ',
            isPartial: true
          }];
        }

        if (data.type === 'delta' && data.text) {
          accumulatedBotResponse += data.text;
          messages = messages.map((msg, index) => {
            if (index === messages.length - 1) {
              return {
                ...msg,
                content: `<strong>Horizon:</strong> ${marked.parse(accumulatedBotResponse)}`
              };
            }
            return msg;
          });
        }

        if (data.type === 'end' || data.type === 'content_block_stop') {
          chatHistory = [...chatHistory, { 
            user: currentUserPrompt, 
            bot: accumulatedBotResponse 
          }];
          currentUserPrompt = '';
          accumulatedBotResponse = '';
          messages = messages.map((msg, index) => {
            if (index === messages.length - 1) {
              return { ...msg, isPartial: false };
            }
            return msg;
          });
        }
      } catch (e) {
        console.error('Error parsing incoming message:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed. Attempting reconnect in 5 seconds...');
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  function handleSubmit() {
    if (!prompt.trim()) return;

    currentUserPrompt = prompt.trim();
    messages = [...messages, {
      type: 'user',
      content: currentUserPrompt,
      isPartial: false
    }];

    const payload = {
      action: "sendMessage",
      prompt: currentUserPrompt,
      language: language,
      chatHistory
    };

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      console.log('WebSocket not ready; unable to send message.');
    }

    prompt = '';
  }

  $: if (messagesDiv) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
</script>

<header class="header">
  <img src="/header_logo.png" alt="ASU Logo">
  <h1>ASU CIC ChatBot</h1>
</header>

<div class="container">
  <div 
    bind:this={messagesDiv} 
    class="messages"
  >

    {#each messages as message}
      <div class="message-wrapper {message.type}">
        <img 
          src={message.type === 'user' ? '/UserAvatar.svg' : '/BotAvatar.png'} 
          alt={`${message.type} avatar`}
          class="avatar {message.type}"
        >
        <div class="message {message.type}">
          {@html message.content}
        </div>
      </div>
    {/each}
  </div>

  <form class="chat-form" on:submit|preventDefault={handleSubmit}>
    <label for="prompt">Enter your prompt:</label><br/>
    <input
      type="text"
      id="prompt"
      bind:value={prompt}
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
    ><br/>

    <label for="language">Language (e.g. "EN"):</label><br/>
    <input
      type="text"
      id="language"
      bind:value={language}
      autocomplete="off"
      autocapitalize="on"
      autocorrect="off"
    ><br/>

    <button type="submit">
      <i class="fas fa-paper-plane"></i>
      Send
    </button>
  </form>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background: #f8f8f8;
  }

  .header {
    display: flex;
    align-items: center;
    background-color: #8C1D40;
    color: #FFFFFF;
    padding: 16px;
  }

  .header img {
    height: 40px;
    margin-right: 16px;
    background-color: #FFFFFF;
  }

  .header h1 {
    font-size: 1.6rem;
    margin: 0;
  }

  .container {
    max-width: 700px;
    margin: 20px auto;
    background: #FFFFFF;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .messages {
    background: #fff;
    height: 350px;
    overflow-y: auto;
    padding: 10px;
    border-bottom: 1px solid #ccc;
  }

  .message-wrapper {
    display: flex;
    align-items: flex-end;
    margin-bottom: 12px;
    max-width: 80%;
    word-wrap: break-word;
  }

  /* Distinguish user from bot alignment */
  .message-wrapper.user {
    flex-direction: row-reverse; /* user on the right */
    margin-left: auto;
  }

  .message-wrapper.bot {
    flex-direction: row; /* bot on the left */
    margin-right: auto;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 0 8px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid #ccc;
  }

  .message {
    padding: 8px 12px;
    border-radius: 6px;
    line-height: 1.4;
    font-size: 0.95rem;
  }

  .message.user {
    background-color: #8C1D40;
    color: #FFFFFF;
  }

  .message.bot {
    background-color: #FFC627;
    color: #000000;
  }

  .chat-form {
    padding: 16px;
  }

  .chat-form label {
    color: #8C1D40;
    font-weight: bold;
  }

  .chat-form input {
    width: 80%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: Arial, sans-serif;
  }

  button {
    background-color: #FFC627;
    color: #000000;
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-family: Arial, sans-serif;
  }

  button i {
    margin-right: 6px;
  }

  button:hover {
    background-color: #E5B81F; /* slightly darker gold */
  }

  :global(.markdown-content-link) {
    text-decoration: none;
    /* color: #000; */
    color: #8C1D40;
    /* font-weight: 700; */
    position: relative;
    display: inline-block;
    z-index: 0;
  }

  :global(.markdown-content-link::before) {
    content: '';
    /* background-color: hsla(341, 66%, 33%, .30); */
    /* background-color: hsla(196, 100%, 44%, .75); */
    background-color: hsla(0, 0%, 100%, .25);
    position: absolute;
    left: 0;
    bottom: 3px;
    width: 100%;
    height: 8px;
    z-index: -1;
    transition: all .3s ease-in-out;
  }

  :global(.markdown-content-link:hover::before) {
    bottom: 0;
    height: 100%;
  }

/* From: https://css-tricks.com/css-link-hover-effects/ */
</style>

