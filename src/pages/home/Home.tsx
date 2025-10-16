import React, { useState } from "react";
import { Eye, ChevronDown } from "lucide-react";
import "./styles.css";
import logo from "../../assets/logo.png";

interface SocioDetalheResponse {
  nome: string;
  participacao: number;
  cnpj: string;
  dadosReceita: {
    razao_social?: string;
    estabelecimento?: {
      cep?: string;
      logradouro?: string;
      numero?: string;
      bairro?: string;
      municipio?: string;
      uf?: string;
    };
    estabelecimentos?: Array<{
      cep?: string;
      logradouro?: string;
      numero?: string;
      bairro?: string;
      municipio?: string;
      uf?: string;
    }>;

    porte?: {
      id?: string;
      descricao?: string;
    };
    natureza_juridica?: {
      id?: string;
      descricao?: string;
    };
    capital_social?: number;
    atividade_principal?: Array<{
      code?: string;
      text?: string;
    }>;
    atividades_secundarias?: Array<{
      code?: string;
      text?: string;
    }>;
  };
  mapaUrl: string;
}

interface ErrorResponse {
  status: number;
  titulo: string;
  detalhes: string;
  validacao: string[];
}

const API_BASE_URL = "http://localhost:8080";

function Home() {
  const [cnpj, setCnpj] = useState<string>("");
  const [detalhes, setDetalhes] = useState<SocioDetalheResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cnaeExpanded, setCnaeExpanded] = useState<boolean>(false);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const numbers = e.target.value.replace(/\D/g, "");
    setCnpj(numbers);
  };

  const handleSearch = async (): Promise<void> => {
    if (!cnpj) {
      alert("Por favor, digite um CNPJ");
      return;
    }

    if (cnpj.length !== 14) {
      alert("CNPJ deve ter 14 dígitos");
      return;
    }

    setLoading(true);
    setError(null);
    setDetalhes(null);

    try {
      const response = await fetch(`${API_BASE_URL}/socios/${cnpj}`);

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(
          errorData.detalhes || "Erro ao buscar dados da empresa"
        );
      }

      const data: SocioDetalheResponse = await response.json();

      setDetalhes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatarCNPJ = (cnpj: string): string => {
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <img src={logo} alt="Logo" className="logo" />
          <span className="title">Societário Insight</span>
        </div>

        <div className="form">
          <label>Participação mínima (%)</label>
          <div className="form-row">
            <input
              type="text"
              placeholder="Digite"
              value={cnpj}
              onChange={handleCnpjChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              maxLength={14}
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? "Pesquisando..." : "Pesquisar"}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {detalhes && (
          <>
            <div className="divider"></div>

            <div className="table-section">
              <div className="table-container">
                <table className="socios-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>CNPJ</th>
                      <th>Participação</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{detalhes.nome}</td>
                      <td>{formatarCNPJ(detalhes.cnpj)}</td>
                      <td>{detalhes.participacao}%</td>
                      <td className="action-cell">
                        <button
                          className="view-button"
                          title="Ver detalhes"
                          onClick={() =>
                            window.open(detalhes.mapaUrl, "_blank")
                          }
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="divider"></div>

            <div className="socio-section">
              <div className="socio-grid">
                <div className="socio-item">
                  <span className="socio-label">Sócio</span>
                  <span className="socio-value">{detalhes.nome}</span>
                </div>
                <div className="socio-item">
                  <span className="socio-label">CNPJ</span>
                  <span className="socio-value">
                    {formatarCNPJ(detalhes.cnpj)}
                  </span>
                </div>
                <div className="socio-item">
                  <span className="socio-label">Participação</span>
                  <span className="socio-value">{detalhes.participacao}%</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>
          </>
        )}

        {!loading && !detalhes && !error && (
          <div className="empty-state">
            Digite um CNPJ (14 dígitos) e clique em pesquisar
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
