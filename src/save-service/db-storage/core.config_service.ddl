DROP TABLE IF EXISTS core.config_service;

CREATE TABLE core.config_service
(
    "configName" varchar(255)  not null,
    "paramPath"  varchar(1024) not null
        constraint config_pk
            primary key,
    "value"      jsonb,
    "updatedAt"  timestamp with time zone default CURRENT_TIMESTAMP not null

);

create index config_service_configname_index on config_service ("configName");

comment on table config_service is 'Хранилище настроек config service';

comment on column config_service."configName" is 'Имя коневого свойства - "именованная конфигурация"';
comment on column config_service."paramPath" is 'Полный путь к свойству, являющемуся "листом" в дереве настроек';
comment on column config_service.value is 'Значение настройки в json формате';
comment on column config_service."updatedAt" is 'Время последнего изменения записи';
