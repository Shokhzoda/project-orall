import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Lock,
  Cloud,
  Layers,
  Terminal,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Copy,
  Info
} from "lucide-react";

export default function SettingsView() {
  const { user, apiFetch } = useAuth();

  // Settings State Managers
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "aws" | "devops">("profile");

  // Code Copy controls state
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText("COPIED!");
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Confirmation password mismatch.");
      return;
    }

    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword })
      });
      setSuccess("Account password compiled and secured on DB.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed updating password credentials.");
    }
  };

  // DevOps configuration contents (Docker, Compose, GHA)
  const dockerComposeYaml = `version: "3.9"

services:
  fashionhub-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fashionhub_production_backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=fashionhub-rds-mysql.ca1932.us-west-2.rds.amazonaws.com
      - DB_USER=fashion_prod_admin
      - DB_PASS=\${STRICT_RDS_MYSQL_SECRET_PASSWORD}
      - JWT_SECRET=\${PROD_HS256_RSA_VERIFIED_SECRET}
    depends_on:
      - fashionhub-db

  fashionhub-db:
    image: mysql:8.0
    container_name: fashionhub_local_rds_replica
    restart: always
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=fashionhub_erp
      - MYSQL_ROOT_PASSWORD=fashion_local_dev_pass`;

  const dockerfileContent = `# Synthesize Production Container Node Environment
FROM node:18-alpine AS deployment-stage

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Clean run production installations
RUN npm ci --only=production

# Copy application assets & static bundles
COPY . .

# Compile application bundle
RUN npm run build

# Ports mapping config
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]`;

  const githubActionsContent = `name: FashionHub Cloud ERP VPC Deploy

on:
  push:
    branches:
      - main

jobs:
  aws_continuous_delivery:
    runs-on: ubuntu-latest
    steps:
      - name: Git Repository Fetch
        uses: actions/checkout@v3

      - name: Build Docker Production Bundle
        run: |
          docker build -t fashionhub-erp:latest .

      - name: Authenticate AWS ECS VPC Role
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: Deploy Image to AWS EC2 Cluster Container Registry
        run: |
          # Push production bundle to ECR and execute rolling update in ECS cluster...`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start font-sans">
      {/* OPERATIONS SIDEBAR SELECTORS */}
      <div className="xl:col-span-1 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#94A3B8] pb-2 border-b border-[#E2E8F0]">Operations System Setup</h3>
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          <User size={15} /> Primary Profile Security
        </button>
        <button
          onClick={() => setActiveTab("aws")}
          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === "aws"
              ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          <Cloud size={15} /> AWS VPC Multi-AZ Blueprints
        </button>
        <button
          onClick={() => setActiveTab("devops")}
          className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeTab === "devops"
              ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
              : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          <Terminal size={15} /> Local Docker &amp; CI/CD Pipelines
        </button>
      </div>

      {/* VIEW DETAILS PANEL */}
      <div className="xl:col-span-3">

        {/* DETAILS SUB PANEL 1: PROFILE SECURITY & CREDENTIALS */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            <div>
              <h2 className="font-sans font-bold text-base text-[#0F172A] leading-tight">Primary User Security Credential Controls</h2>
              <p className="text-xs text-[#64748B]">Revise your identity profile parameters, database credentials, and system login keys.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Profile Details (Read Only) */}
              <div className="space-y-4 bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                <h3 className="font-bold text-xs text-[#0F172A] border-b border-[#E2E8F0] pb-2 uppercase tracking-wide font-mono text-slate-500">
                  Primary Profile Attributes
                </h3>
                <div className="space-y-3.5 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#64748B] block font-bold">Designated Username Username</span>
                    <strong className="text-[#0F172A]">{user?.username}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#64748B] block font-bold">User Permission Role Authority</span>
                    <strong className="inline-block bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded text-[10px] font-bold mt-0.5">
                      {user?.role} Role
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#64748B] block font-bold">AWS Account Reference ID</span>
                    <strong className="text-[#0F172A] font-mono">aws-iam-fashionhub-prod-admin</strong>
                  </div>
                </div>
              </div>

              {/* Password update form */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <h3 className="font-bold text-xs text-[#0F172A] pb-2 border-b border-[#E2E8F0] uppercase tracking-wide font-mono text-slate-500">
                  Update Account Credentials
                </h3>

                {success && (
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <CheckCircle size={14} /> {success}
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Historic password key *</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="Enter traditional old credential key"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Fresh password compile key *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Confirm fresh secure compilation password"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Re-type compiled key *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Verify fresh secure password matches exactly"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Compile &amp; Save Credentials
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DETAILS SUB PANEL 2: AWS VPC ARCHITECTURE DIAGRAM */}
        {activeTab === "aws" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-2 border-b border-[#E2E8F0]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#2563EB]">System Architecture Design blueprint</span>
                <h2 className="font-sans font-bold text-base text-[#0F172A] leading-tight mt-0.5">FashionHub AWS Multi-AZ High-Availability Network Map</h2>
                <p className="text-xs text-[#64748B]">VPC Network Layout configured with public App load balancing and isolated RDS storage layers.</p>
              </div>
              <div className="bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1">
                <ShieldCheck size={12} /> COMPLIANT CLOUD ARCHITECTURE
              </div>
            </div>

            {/* ARTISTIC CLOUD SCHEMATIC */}
            <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-6 text-white text-xs space-y-6 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#2563EB]/10 rounded-full blur-2xl" />

              <h4 className="font-sans font-bold text-xs flex items-center gap-1.5 uppercase font-mono tracking-wider text-slate-400">
                <Cloud size={14} className="text-[#3b82f6]" /> REGION: US-WEST-2 (OREGON REGION &bull; MULTI-AZ)
              </h4>

              {/* NETWORK ARCHITECTURE CHANNELS */}
              <div className="space-y-4 font-mono text-[10px]">

                {/* IGW AND ALB */}
                <div className="flex flex-col items-center gap-1.5 bg-[#1E293B]/70 p-4 border border-[#334155] rounded-xl text-center relative">
                  <span className="absolute -top-2 px-2 bg-[#2563EB] text-white text-[8px] rounded font-bold uppercase">Public Ingress Gate</span>
                  <p className="font-bold text-[#60A5FA]">Internet Gateway (IGW) &bull; Standard Public traffic</p>
                  <div className="w-0.5 h-4 bg-[#334155] border-dashed border" />
                  <p className="bg-[#334155] px-3 py-1.5 rounded font-bold border border-blue-500/30 text-white leading-normal">
                    Application Load Balancer (ALB)<br />
                    <span className="text-[9px] font-normal text-slate-400">Routes HTTP/HTTPS queries across Auto Scaling App pools on Port 3000.</span>
                  </p>
                </div>

                {/* SUBNET LAYERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PUBLIC SUBNET Pool */}
                  <div className="border border-yellow-500/30 bg-[#1E293B]/40 p-4 rounded-xl text-center relative space-y-2.5">
                    <span className="absolute -top-2 left-4 px-2 bg-yellow-500 text-slate-950 text-[8px] rounded font-bold uppercase">
                      Public DMZ Subnet group
                    </span>
                    <p className="font-bold text-yellow-400">CIDR: 10.0.1.0/24 &bull; Availability Zone A</p>
                    <div className="bg-[#0F172A] border border-[#334155] p-3 rounded text-[9px] space-y-1.5 text-left text-slate-200">
                      <p className="font-bold text-[#10B981]">&bull; NAT Gateway Node active (10.0.1.50)</p>
                      <p className="text-slate-400">Handles outbound routing for private RDS system updates.</p>
                    </div>
                  </div>

                  {/* PRIVATE SUBNET Isolated Pool */}
                  <div className="border border-green-500/30 bg-[#1E293B]/40 p-4 rounded-xl text-center relative space-y-2.5">
                    <span className="absolute -top-2 left-4 px-2 bg-[#10B981] text-white text-[8px] rounded font-bold uppercase text-center">
                      Isolated Private database Subnets
                    </span>
                    <p className="font-bold text-[#10B981]">CIDR: 10.0.10.0/24 &amp; 10.0.11.0/24</p>
                    <div className="bg-[#0F172A] border border-[#334155] p-3 rounded text-[9px] space-y-1 text-left text-slate-200">
                      <p className="font-bold text-[#3B82F6]">&bull; AWS ECS Cluster running Docker App pods</p>
                      <p className="font-bold text-purple-400">&bull; Amazon RDS Multi-AZ MySQL (Master/Replica)</p>
                      <p className="text-slate-400">Replicates across isolated AZs in private tables.</p>
                    </div>
                  </div>
                </div>

                {/* SECURITY SECURITY GROUPS */}
                <div className="bg-[#1E293B]/30 border border-[#334155] p-4 rounded-xl space-y-2">
                  <p className="font-bold text-slate-300">Compliant Infrastructure Security Regulations:</p>
                  <table className="w-full text-left text-[9px] text-slate-400 border-t border-[#334155] mt-1">
                    <thead>
                      <tr className="text-slate-300 h-6">
                        <th>Target Security Group</th>
                        <th>Inbound / Egress Regulations Allowed</th>
                        <th>Sourcing CIDR/Security Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]">
                      <tr className="h-6">
                        <td className="font-bold text-white">sg-01_alb_ingress</td>
                        <td>Inbound HTTP / HTTPS (80, 443)</td>
                        <td>0.0.0.0/0 (Global WAN traffic)</td>
                      </tr>
                      <tr className="h-6">
                        <td className="font-bold text-white">sg-02_app_pool</td>
                        <td>Inbound Custom TCP (Port 3000)</td>
                        <td>sg-01_alb_ingress (ALB proxy limits)</td>
                      </tr>
                      <tr className="h-6">
                        <td className="font-bold text-white">sg-03_rds_storage</td>
                        <td>Inbound Custom MySQL (Port 3306)</td>
                        <td>sg-02_app_pool (Direct App bounds only)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* DETAILS SUB PANEL 3: DEVOPS CONFIGURATION BLUEPRINTS */}
        {activeTab === "devops" && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            <div>
              <h2 className="font-sans font-bold text-base text-[#0F172A] leading-tight">DevOps configurations: Docker compose &amp; CI/CD Pipelines</h2>
              <p className="text-xs text-[#64748B]">These production configurations enable immediate, reproducible scaling and delivery.</p>
            </div>

            {/* DOCKER COMPOSE BLUEPRINT */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[#475569]">
                <span className="flex items-center gap-1.5"><Layers size={14} /> Production docker-compose.yml spec</span>
                <button
                  onClick={() => copyToClipboard(dockerComposeYaml)}
                  className="bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                >
                  <Copy size={11} /> {copiedText || "COPY docker-compose.yml"}
                </button>
              </div>
              <pre className="p-4 bg-[#0F172A] text-slate-300 font-mono text-[9px] rounded-xl border border-[#334155] leading-relaxed overflow-x-auto max-h-56">
                {dockerComposeYaml}
              </pre>
            </div>

            {/* DOCKERFILE BLUEPRINT */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[#475569]">
                <span className="flex items-center gap-1.5"><Cpu size={14} /> Optimization Dockerfile configuration</span>
                <button
                  onClick={() => copyToClipboard(dockerfileContent)}
                  className="bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                >
                  <Copy size={11} /> {copiedText || "COPY Dockerfile"}
                </button>
              </div>
              <pre className="p-4 bg-[#0F172A] text-slate-300 font-mono text-[9px] rounded-xl border border-[#334155] leading-relaxed overflow-x-auto max-h-56">
                {dockerfileContent}
              </pre>
            </div>

            {/* GITHUB ACTIONS BLUEPRINT */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[#475569]">
                <span className="flex items-center gap-1.5"><Terminal size={14} /> GitHub Actions CI/CD Continuous Delivery script</span>
                <button
                  onClick={() => copyToClipboard(githubActionsContent)}
                  className="bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1"
                >
                  <Copy size={11} /> {copiedText || "COPY CI/CD deploy.yml"}
                </button>
              </div>
              <pre className="p-4 bg-[#0F172A] text-slate-300 font-mono text-[9px] rounded-xl border border-[#334155] leading-relaxed overflow-x-auto max-h-56">
                {githubActionsContent}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
