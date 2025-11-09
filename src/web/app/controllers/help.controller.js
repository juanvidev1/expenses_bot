class HelpController {
  static commandsList = (req, res) => {
    console.log('Ejecutando commandsList - versión actualizada');
    const commands = [
      { command: '/start', description: 'Iniciar el bot' },
      { command: '/help', description: 'Mostrar ayuda' },
      { command: '/registrarse', description: 'Registrar usuario' },
      {
        command: '/consultar_usuario',
        description: 'Consultar datos del usuario',
      },
      { command: '/agregar_gasto', description: 'Agregar un nuevo gasto' },
      {
        command: '/consultar_gastos',
        description: 'Consultar gastos registrados',
      },
      {
        command: 'OPEN_ROUTER_TOKEN',
        description:
          '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',
      },
    ];
    res.json(commands);
  };
}

export { HelpController };
