DROP TABLE IF EXISTS core.config_service_history;

CREATE TABLE core.config_service_history
(
    "configName" varchar(255)  not null,
    "paramPath"  varchar(1024) not null
        constraint config_history_pk
            primary key,
    "value"      jsonb,
    "updatedAt"  timestamp with time zone default CURRENT_TIMESTAMP not null,
    "updatedBy"  varchar(255)
);

create index config_service_history_configname_index on core.config_service_history ("configName");

comment on table core.config_service_history is 'Хранилище истории изменений настроек config service';

comment on column core.config_service_history."configName" is 'Имя коневого свойства - "именованная конфигурация"';
comment on column core.config_service_history."paramPath" is 'Полный путь к свойству, являющемуся "листом" в дереве настроек';
comment on column core.config_service_history.value is 'Значение настройки в json формате';
comment on column core.config_service_history."updatedAt" is 'Время последнего изменения записи';
comment on column core.config_service_history."updatedBy" is 'Имя пользователя, изменившего запись';
