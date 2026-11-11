-- Senha dos usuários de teste: Senha@123 (armazenada com bcrypt)
-- CPF armazenado com AES-256-GCM (chave CRYPTO_KEY do .env.example)
CREATE DATABASE IF NOT EXISTS saep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saep_db;

DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS colaboradores;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL
);

CREATE TABLE colaboradores (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  cpf VARCHAR(255) NOT NULL,
  cargo VARCHAR(80) NOT NULL
);

CREATE TABLE tarefas (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL,
  descricao VARCHAR(500) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
  colaborador_id INT NOT NULL,
  CONSTRAINT fk_tarefa_colab FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id)
);

CREATE TABLE agendamentos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tarefa_id INT NOT NULL,
  data_entrega DATE NOT NULL,
  observacao VARCHAR(255) NULL,
  CONSTRAINT fk_agenda_tarefa FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE
);

INSERT INTO usuarios (nome, email, senha) VALUES
  ('Ana Souza', 'ana@empresa.com', '$2a$10$th0lzX9nkEBZRxjmaXO1Aug2ug/dI6yTie6qYiFNZjetoJr8vt5PW'),
  ('Bruno Lima', 'bruno@empresa.com', '$2a$10$o/GJb5k8.d1755N5CySmXeiA1eL9xcbLuv8VmjhVtCXT7V9AX8WSK'),
  ('Carla Dias', 'carla@empresa.com', '$2a$10$YZK0lo2/2nR9kOSeUIsDluXKajWYg2Kz5Ld8/vjBLKf.OqwKxaKHG');

INSERT INTO colaboradores (nome, email, cpf, cargo) VALUES
  ('Diego Martins', 'diego@empresa.com', 'pI0PnGeEVfeJNn+v:UQ2Uxgqj4k/2TCP/6Pd52w==:yL90xgF2ZKKt4qM=', 'Analista'),
  ('Elisa Ramos', 'elisa@empresa.com', 'lx7EHbpjM30MuYGx:s7v445pVRZO9dlqsLuY1ZA==:v/FfmTQ1Kde9OX4=', 'Desenvolvedora'),
  ('Fábio Nunes', 'fabio@empresa.com', 'ZD1k4trjE8gapgwd:GwkrM+W78zzC6P/qKyL8/Q==:OK0ju1NCJE8XIFU=', 'Gerente de Projetos');

INSERT INTO tarefas (titulo, descricao, status, colaborador_id) VALUES
  ('Levantar requisitos', 'Reunião com o cliente e documento de requisitos', 'CONCLUIDA', 1),
  ('Modelar banco de dados', 'Criar o DER e o script SQL', 'ANDAMENTO', 2),
  ('Publicar sistema', 'Deploy e validação final', 'PENDENTE', 3);

INSERT INTO agendamentos (tarefa_id, data_entrega, observacao) VALUES
  (1, '2026-11-20', 'Entrega ao cliente'),
  (2, '2026-11-27', 'Revisar com o gerente'),
  (3, '2026-12-10', 'Após homologação');
