/*
    Inicialización de la base de datos de Alerta Verde en SQL Server.

    Uso (desde la carpeta backend/):
        sqlcmd -S localhost\SQLEXPRESS -U sa -P TU_PASSWORD -i sql/init.sql

    Si la base ya existe, el bloque de CREATE DATABASE no hace nada.
    Las tablas existentes tampoco se modifican.
*/

IF DB_ID(N'EjemploDB') IS NULL
BEGIN
    CREATE DATABASE EjemploDB;
END
GO

USE EjemploDB;
GO

IF OBJECT_ID(N'dbo.Reporte', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reporte (
        id            INT IDENTITY(1, 1) NOT NULL
                          CONSTRAINT PK_Reporte PRIMARY KEY,
        categoria     NVARCHAR(50)  NOT NULL,
        zona          NVARCHAR(50)  NOT NULL,
        ubicacion     NVARCHAR(200) NOT NULL,
        descripcion   NVARCHAR(500) NOT NULL,
        fotoUrl       NVARCHAR(300) NULL,
        estado        NVARCHAR(20)  NOT NULL
                          CONSTRAINT DF_Reporte_estado DEFAULT N'Pendiente',
        comentario    NVARCHAR(300) NULL,
        fechaCreacion DATETIME2     NOT NULL
                          CONSTRAINT DF_Reporte_fecha DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.Usuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuario (
        id            INT IDENTITY(1, 1) NOT NULL
                          CONSTRAINT PK_Usuario PRIMARY KEY,
        email         NVARCHAR(255) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        fecha_creacion DATETIME2    NOT NULL
                          CONSTRAINT DF_Usuario_fecha DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Usuario_email UNIQUE (email)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Reporte_estado' AND object_id = OBJECT_ID(N'dbo.Reporte')
)
BEGIN
    CREATE INDEX IX_Reporte_estado ON dbo.Reporte (estado);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Reporte_fecha' AND object_id = OBJECT_ID(N'dbo.Reporte')
)
BEGIN
    CREATE INDEX IX_Reporte_fecha ON dbo.Reporte (fechaCreacion DESC);
END
GO
