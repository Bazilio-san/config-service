DROP TABLE IF EXISTS core.config_service_history;

CREATE TABLE core.config_service_history
(
    "historyPath"  varchar(1024) not null
        constraint config_service_history_pk
            primary key,
    "configName" varchar(255)  not null,
    "paramPath"  varchar(1024) not null,
    "value"      jsonb,
    "updatedAt"  timestamp with time zone default CURRENT_TIMESTAMP not null,
    "updatedBy"  varchar(255)
);

comment on table core.config_service_history is 'Хранилище истории изменений настроек config service';

comment on column core.config_service_history."historyPath" is 'Уникальный ключ, который состоит из полного пути к свойству, имени пользователя, изменившего запись, и времени изменения с точностью до часа';
comment on column core.config_service_history."configName" is 'Имя коневого свойства - "именованная конфигурация"';
comment on column core.config_service_history."paramPath" is 'Полный путь к свойству, являющемуся "листом" в дереве настроек';
comment on column core.config_service_history.value is 'Значение настройки в json формате';
comment on column core.config_service_history."updatedAt" is 'Время последнего изменения записи';
comment on column core.config_service_history."updatedBy" is 'Имя пользователя, изменившего запись';

CREATE INDEX "ix_core_config_service_history_configName" ON core.config_service_history ("configName");
CREATE INDEX "ix_core_config_service_history_paramPath" ON core.config_service_history ("paramPath");
CREATE INDEX "ix_core_config_service_history_updatedAt" ON core.config_service_history ("updatedAt");
CREATE INDEX "ix_core_config_service_history_updatedBy" ON core.config_service_history ("updatedBy");