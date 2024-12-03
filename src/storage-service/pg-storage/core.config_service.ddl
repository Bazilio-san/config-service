DROP TABLE IF EXISTS core.config_service;

CREATE TABLE core.config_service
(
    "configName" varchar(255)  not null,
    "paramPath"  varchar(1024) not null
        constraint config_service_pk
            primary key,
    "value"      jsonb,
    "updatedAt"  timestamp with time zone default CURRENT_TIMESTAMP not null,
    "updatedBy"  varchar(255)
);

comment on table core.config_service is 'Хранилище настроек config service';

comment on column core.config_service."configName" is 'Имя коневого свойства - "именованная конфигурация"';
comment on column core.config_service."paramPath" is 'Полный путь к свойству, являющемуся "листом" в дереве настроек';
comment on column core.config_service.value is 'Значение настройки в json формате';
comment on column core.config_service."updatedAt" is 'Время последнего изменения записи';
comment on column core.config_service."updatedBy" is 'Имя пользователя, изменившего запись';

CREATE INDEX "ix_core_config_service_configName" ON core.config_service ("configName");
CREATE INDEX "ix_core_config_service_updatedAt" ON core.config_service ("updatedAt");
CREATE INDEX "ix_core_config_service_updatedBy" ON core.config_service ("updatedBy");
