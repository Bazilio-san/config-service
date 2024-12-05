const getConfigTableInitScript = (schema, table) => `DROP TABLE IF EXISTS "${schema}"."${table}";

CREATE TABLE "${schema}"."${table}"
(
    "configName" varchar(255)  not null,
    "paramPath"  varchar(1024) not null
        constraint "${table}_pk"
            primary key,
    "value"      jsonb,
    "updatedAt"  timestamp with time zone default CURRENT_TIMESTAMP not null,
    "updatedBy"  varchar(255)
);

comment on table "${schema}"."${table}" is 'Хранилище настроек config service';

comment on column "${schema}"."${table}"."configName" is 'Имя коневого свойства - "именованная конфигурация"';
comment on column "${schema}"."${table}"."paramPath" is 'Полный путь к свойству, являющемуся "листом" в дереве настроек';
comment on column "${schema}"."${table}".value is 'Значение настройки в json формате';
comment on column "${schema}"."${table}"."updatedAt" is 'Время последнего изменения записи';
comment on column "${schema}"."${table}"."updatedBy" is 'Имя пользователя, изменившего запись';

CREATE INDEX "ix_${schema}_${table}_configName" ON "${schema}"."${table}" ("configName");
CREATE INDEX "ix_${schema}_${table}_updatedAt" ON "${schema}"."${table}" ("updatedAt");
CREATE INDEX "ix_${schema}_${table}_updatedBy" ON "${schema}"."${table}" ("updatedBy");`;

module.exports = { getConfigTableInitScript };
