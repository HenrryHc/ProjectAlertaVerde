/*
    BASE DE DATOS: ALERTA VERDE
*/

IF DB_ID(N'AlertaVerdeDB') IS NULL
BEGIN
    CREATE DATABASE AlertaVerdeDB;
END
GO

USE AlertaVerdeDB;
GO

-- ==========================================
-- TABLA REPORTE
-- ==========================================

IF OBJECT_ID(N'dbo.Reporte', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reporte (
        id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Reporte PRIMARY KEY,

        categoria NVARCHAR(50) NOT NULL,
        zona NVARCHAR(50) NOT NULL,
        ubicacion NVARCHAR(200) NOT NULL,
        descripcion NVARCHAR(500) NOT NULL,

        foto_url NVARCHAR(300) NULL,

        estado NVARCHAR(20) NOT NULL
            CONSTRAINT DF_Reporte_estado
            DEFAULT N'Pendiente',

        comentario NVARCHAR(300) NULL,

        fecha_creacion DATETIME2 NOT NULL
            CONSTRAINT DF_Reporte_fecha_creacion
            DEFAULT SYSUTCDATETIME()
    );
END
GO

-- ==========================================
-- TABLA USUARIO
-- ==========================================

IF OBJECT_ID(N'dbo.Usuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuario (
        id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Usuario PRIMARY KEY,

        email NVARCHAR(255) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,

        fecha_creacion DATETIME2 NOT NULL
            CONSTRAINT DF_Usuario_fecha
            DEFAULT SYSUTCDATETIME(),

        CONSTRAINT UQ_Usuario_email UNIQUE (email)
    );
END
GO

-- ==========================================
-- ÍNDICES
-- ==========================================

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Reporte_estado'
      AND object_id = OBJECT_ID(N'dbo.Reporte')
)
BEGIN
    CREATE INDEX IX_Reporte_estado
    ON dbo.Reporte(estado);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Reporte_fecha'
      AND object_id = OBJECT_ID(N'dbo.Reporte')
)
BEGIN
    CREATE INDEX IX_Reporte_fecha
    ON dbo.Reporte(fecha_creacion DESC);
END
GO