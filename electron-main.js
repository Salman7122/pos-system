const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // إنشاء نافذة المتصفح الرئيسية
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'), // أضف أيقونة إذا كانت متوفرة
    title: 'سلمان - نظام إدارة نقاط البيع',
    show: false
  });

  // تحميل ملف HTML الرئيسي
  mainWindow.loadFile('index.html');

  // إظهار النافذة عندما تكون جاهزة
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // إغلاق التطبيق عند إغلاق النافذة
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // إزالة قائمة السياق الافتراضية
  mainWindow.setMenuBarVisibility(false);

  // إعداد قائمة مخصصة
  const template = [
    {
      label: 'ملف',
      submenu: [
        {
          label: 'خروج',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'عرض',
      submenu: [
        {
          label: 'إعادة تحميل',
          accelerator: 'Ctrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'أدوات المطور',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        },
        {
          label: 'شاشة كاملة',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    {
      label: 'مساعدة',
      submenu: [
        {
          label: 'حول',
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
              parent: mainWindow,
              modal: true,
              resizable: false,
              title: 'حول النظام'
            });
            aboutWindow.loadURL(`data:text/html;charset=utf-8,
              <html dir="rtl">
                <head>
                  <title>حول النظام</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                    h1 { color: #4f46e5; }
                  </style>
                </head>
                <body>
                  <h1>سلمان - نظام إدارة نقاط البيع</h1>
                  <p>الإصدار: 1.0.0</p>
                  <p>مطور: سلمان</p>
                  <p>نظام إدارة شامل لنقاط البيع باللغة العربية</p>
                </body>
              </html>
            `);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// إنشاء النافذة عندما يكون التطبيق جاهز
app.whenReady().then(createWindow);

// إغلاق التطبيق عند إغلاق جميع النوافذ (macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// إعادة إنشاء النافذة عند النقر على أيقونة التطبيق (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// منع إعادة تشغيل التطبيق في وضع التطوير
if (require('electron-squirrel-startup')) {
  app.quit();
}