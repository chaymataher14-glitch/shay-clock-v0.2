    let resolvedAccentText = theme.accentText || theme.text;
    setTheme('--accent-text', resolvedAccentText);
    document.getElementById('accent-text-picker').value = resolvedAccentText;
