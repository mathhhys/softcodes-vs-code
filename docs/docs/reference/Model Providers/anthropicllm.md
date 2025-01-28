# Anthropic

To setup Anthropic, obtain an API key from [here](https://www.anthropic.com/api) and add the following to your `config.json` file:

```json title="~/.softcodes/config.json"
{
  "models": [
    {
      "title": "Anthropic",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20240620",
      "apiKey": "YOUR_API_KEY"
    }
  ]
}
```
