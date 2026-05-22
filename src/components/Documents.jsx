import React, { useState, useEffect } from 'react';
import { File, Download, Upload, X, Filter, Eye } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Helper content generators for mock downloads
const getBlueprintSVG = (projectName, location) => {
  const safeProj = projectName || 'Construction Project';
  const safeLoc = location || 'Work Site Address';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <rect width="800" height="600" fill="#0b1329"/>
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none"/>
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 210, 255, 0.12)" stroke-width="0.5"/>
      <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(0, 210, 255, 0.25)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#grid)" />
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="rgba(0, 210, 255, 0.4)" stroke-width="1.5" stroke-dasharray="5,5" />
  <rect x="60" y="60" width="680" height="400" fill="none" stroke="#00d2ff" stroke-width="3" />
  <line x1="260" y1="60" x2="260" y2="460" stroke="#00d2ff" stroke-width="2" />
  <line x1="520" y1="60" x2="520" y2="460" stroke="#00d2ff" stroke-width="2" />
  <line x1="260" y1="240" x2="520" y2="240" stroke="#00d2ff" stroke-width="2" stroke-dasharray="4,4" />
  <rect x="55" y="55" width="10" height="10" fill="#00d2ff" />
  <rect x="255" y="55" width="10" height="10" fill="#00d2ff" />
  <rect x="515" y="55" width="10" height="10" fill="#00d2ff" />
  <rect x="735" y="55" width="10" height="10" fill="#00d2ff" />
  <rect x="55" y="235" width="10" height="10" fill="#00d2ff" />
  <rect x="255" y="235" width="10" height="10" fill="#00d2ff" />
  <rect x="515" y="235" width="10" height="10" fill="#00d2ff" />
  <rect x="735" y="235" width="10" height="10" fill="#00d2ff" />
  <rect x="55" y="455" width="10" height="10" fill="#00d2ff" />
  <rect x="255" y="455" width="10" height="10" fill="#00d2ff" />
  <rect x="515" y="455" width="10" height="10" fill="#00d2ff" />
  <rect x="735" y="455" width="10" height="10" fill="#00d2ff" />
  <text x="160" y="260" fill="rgba(0, 210, 255, 0.7)" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold">LIVING ROOM</text>
  <text x="390" y="150" fill="rgba(0, 210, 255, 0.7)" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold">KITCHEN</text>
  <text x="390" y="350" fill="rgba(0, 210, 255, 0.7)" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold">DINING ROOM</text>
  <text x="630" y="260" fill="rgba(0, 210, 255, 0.7)" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold">BEDROOM</text>
  <circle cx="720" cy="510" r="20" fill="none" stroke="#00d2ff" stroke-width="1"/>
  <line x1="720" y1="530" x2="720" y2="490" stroke="#00d2ff" stroke-width="1.5" />
  <polygon points="720,485 715,495 725,495" fill="#00d2ff" />
  <text x="720" y="480" fill="#00d2ff" font-family="monospace" font-size="10" text-anchor="middle">N</text>
  <g stroke="rgba(0, 210, 255, 0.5)" stroke-width="1">
    <line x1="60" y1="40" x2="740" y2="40" />
    <line x1="60" y1="35" x2="60" y2="45" />
    <line x1="260" y1="35" x2="260" y2="45" />
    <line x1="520" y1="35" x2="520" y2="45" />
    <line x1="740" y1="35" x2="740" y2="45" />
  </g>
  <g fill="rgba(0, 210, 255, 0.9)" font-family="monospace" font-size="10" text-anchor="middle">
    <text x="160" y="32">6.20m</text>
    <text x="390" y="32">7.50m</text>
    <text x="630" y="32">6.20m</text>
    <text x="390" y="22" font-size="12" font-weight="bold">TOTAL WIDTH: 19.90m</text>
  </g>
  <rect x="60" y="475" width="280" height="95" fill="#0b1329" stroke="#00d2ff" stroke-width="1.5" />
  <line x1="60" y1="505" x2="340" y2="505" stroke="#00d2ff" stroke-width="1" />
  <line x1="60" y1="535" x2="340" y2="535" stroke="#00d2ff" stroke-width="1" />
  <line x1="200" y1="535" x2="200" y2="570" stroke="#00d2ff" stroke-width="1" />
  <text x="70" y="495" fill="#00d2ff" font-family="monospace" font-size="11" font-weight="bold">ASCA SOLUTIONS - BUILDPRO</text>
  <text x="70" y="522" fill="#00d2ff" font-family="monospace" font-size="9">PROJECT: ${safeProj}</text>
  <text x="70" y="550" fill="#00d2ff" font-family="monospace" font-size="8">LOCATION: ${safeLoc}</text>
  <text x="70" y="562" fill="#00d2ff" font-family="monospace" font-size="8">PLAN: ARQ-PLN-01</text>
  <text x="210" y="550" fill="#00d2ff" font-family="monospace" font-size="8">DATE: 2026</text>
  <text x="210" y="562" fill="#00d2ff" font-family="monospace" font-size="8">SCALE: 1:50</text>
</svg>`;
};

const getContractText = (projectName, location, budget, deadline) => {
  return `CONSTRUCTION AND CIVIL WORKS SERVICES CONTRACT

This Construction Services Contract (hereinafter, the "Contract") is entered into and made effective as of ${new Date().toLocaleDateString()}, by and between:

CONTRACTOR: ASCA Solutions LLC, formally incorporated with address at Vercel & Supabase Cloud.
OWNER / CLIENT: Sonia Home LLC.

Both parties agree to be bound by the following clauses and conditions regarding the development of the project:

1. PROJECT DESCRIPTION
The Contractor commits to executing, coordinating, and completing the construction work of the project named:
Project Name: ${projectName || 'All Projects'}
Project Location: ${location || 'Not specified'}

2. BUDGET AND COSTS
The agreed cost for the total execution of the project is $${Number(budget || 0).toLocaleString()} USD (United States Dollars). This amount includes the acquisition of major materials, hiring of authorized subcontractors, and technical supervision, unless modified and approved in writing in the daily logs.

3. DELIVERY DEADLINE
Construction work shall begin immediately upon signing this document, and the target deadline for final completion is set for:
Deadline: ${deadline ? new Date(deadline).toLocaleDateString() : 'Not specified'}

4. REPRESENTATIONS AND WARRANTIES
The Contractor warrants that all labor and materials provided will strictly comply with current local building codes. A warranty against hidden defects is granted for twelve (12) months from the date of final delivery.

In witness whereof, both parties sign this contract.

___________________________               ___________________________
For the Owner (Sonia Home LLC)       For the Contractor (ASCA Solutions)
`;
};

const getEstimateCSV = (projectName, budget) => {
  const cimentacion = Math.round(budget * 0.15);
  const estructura = Math.round(budget * 0.30);
  const sistemas = Math.round(budget * 0.25);
  const acabados = Math.round(budget * 0.20);
  const contingencias = Math.round(budget * 0.10);
  
  return `ESTIMATED BUDGET AND COST BREAKDOWN
Project: ${projectName || 'All Projects'}
Date: ${new Date().toLocaleDateString()}
Currency: USD

Category,Percentage (%),Assigned Amount (USD),Description
Foundation & Soils,15.00%,${cimentacion},Excavation and test concrete footings
Framing & Structure,30.00%,${estructura},Load-bearing walls and test roof framing
MEP Installations,25.00%,${sistemas},Electrical wiring and test HVAC systems
Interior/Exterior Finishes,20.00%,${acabados},Painting flooring and test doors
Permits & Contingencies,10.00%,${contingencias},Unforeseen contingency fund and test licensing
GRAND TOTAL,100.00%,${budget},Total estimated budget for the project
`;
};

const getGeneralPermitText = (fileName, projectName, location) => {
  return `METROPOLITAN BUILDING LICENSE AND CONSTRUCTION PERMITS
License Code: PERMIT-${Math.floor(100000 + Math.random() * 900000)}

Through this document, the Department of Urban Planning and Territorial Control certifies that the project:
Project: ${projectName || 'All Projects'}
Location: ${location || 'Not specified'}

Has obtained approval and the corresponding official construction permit for file "${fileName}".

AUTHORIZATION SPECIFICATIONS:
- Permit Status: ACTIVE / APPROVED
- Project Category: Residential / Commercial Building
- Assigned Inspector: Roberto S., PE
- Inspection Validity: 12 months from issue date.

It is strictly mandatory to maintain a printed copy of this license and the approved plans at the construction site for periodic municipal inspections.

Issue Date: ${new Date().toLocaleDateString()}
Stamp & Signature: Directorate General of Public Works
`;
};

// Premium Modal Visualizers
const BlueprintViewer = ({ projectName, location }) => {
  return (
    <div style={{
      background: '#0b1329',
      border: '2px solid #00d2ff',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      color: '#00d2ff',
      fontFamily: 'monospace',
      boxShadow: 'inset 0 0 20px rgba(0,210,255,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,210,255,0.3)', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
        <span>STRUCTURAL PLAN VIEW - SCALE 1:50</span>
        <span>PROJECT: {projectName.toUpperCase()}</span>
      </div>
      
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
        <svg viewBox="0 0 800 500" style={{ minWidth: '600px', width: '100%', height: 'auto', background: '#0b1329' }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="none"/>
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 210, 255, 0.1)" strokeWidth="0.5"/>
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(0, 210, 255, 0.25)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid)" />
          
          <rect x="20" y="20" width="760" height="460" fill="none" stroke="rgba(0, 210, 255, 0.4)" strokeWidth="1.5" strokeDasharray="5,5" />
          
          <rect x="80" y="80" width="640" height="340" fill="none" stroke="#00d2ff" strokeWidth="3" />
          
          <line x1="280" y1="80" x2="280" y2="420" stroke="#00d2ff" strokeWidth="2" />
          <line x1="520" y1="80" x2="520" y2="420" stroke="#00d2ff" strokeWidth="2" />
          <line x1="280" y1="230" x2="520" y2="230" stroke="#00d2ff" strokeWidth="2" strokeDasharray="4,4" />
          
          <rect x="75" y="75" width="10" height="10" fill="#00d2ff" />
          <rect x="275" y="75" width="10" height="10" fill="#00d2ff" />
          <rect x="515" y="75" width="10" height="10" fill="#00d2ff" />
          <rect x="715" y="75" width="10" height="10" fill="#00d2ff" />
          <rect x="75" y="225" width="10" height="10" fill="#00d2ff" />
          <rect x="275" y="225" width="10" height="10" fill="#00d2ff" />
          <rect x="515" y="225" width="10" height="10" fill="#00d2ff" />
          <rect x="715" y="225" width="10" height="10" fill="#00d2ff" />
          <rect x="75" y="415" width="10" height="10" fill="#00d2ff" />
          <rect x="275" y="415" width="10" height="10" fill="#00d2ff" />
          <rect x="515" y="415" width="10" height="10" fill="#00d2ff" />
          <rect x="715" y="415" width="10" height="10" fill="#00d2ff" />
          
          <text x="180" y="250" fill="rgba(0, 210, 255, 0.7)" textAnchor="middle" fontSize="14" fontWeight="bold">LIVING ROOM</text>
          <text x="400" y="160" fill="rgba(0, 210, 255, 0.7)" textAnchor="middle" fontSize="14" fontWeight="bold">KITCHEN</text>
          <text x="400" y="330" fill="rgba(0, 210, 255, 0.7)" textAnchor="middle" fontSize="14" fontWeight="bold">DINING ROOM</text>
          <text x="620" y="250" fill="rgba(0, 210, 255, 0.7)" textAnchor="middle" fontSize="14" fontWeight="bold">BEDROOM</text>
          
          <circle cx="730" cy="420" r="20" fill="none" stroke="#00d2ff" strokeWidth="1"/>
          <line x1="730" y1="440" x2="730" y2="400" stroke="#00d2ff" strokeWidth="1.5" />
          <polygon points="730,395 725,405 735,405" fill="#00d2ff" />
          <text x="730" y="390" fill="#00d2ff" fontSize="10" textAnchor="middle">N</text>

          <g stroke="rgba(0, 210, 255, 0.5)" strokeWidth="1">
            <line x1="80" y1="50" x2="720" y2="50" />
            <line x1="80" y1="45" x2="80" y2="55" />
            <line x1="280" y1="45" x2="280" y2="55" />
            <line x1="520" y1="45" x2="520" y2="55" />
            <line x1="720" y1="45" x2="720" y2="55" />
          </g>
          <g fill="rgba(0, 210, 255, 0.9)" fontSize="10" textAnchor="middle">
            <text x="180" y="42">6.20m</text>
            <text x="400" y="42">7.50m</text>
            <text x="620" y="42">6.20m</text>
            <text x="400" y="32" fontSize="12" fontWeight="bold">TOTAL WIDTH: 19.90m</text>
          </g>

          <rect x="525" y="345" width="230" height="110" fill="#0b1329" stroke="#00d2ff" strokeWidth="1.5" />
          <line x1="525" y1="375" x2="755" y2="375" stroke="#00d2ff" strokeWidth="1" />
          <line x1="525" y1="410" x2="755" y2="410" stroke="#00d2ff" strokeWidth="1" />
          <line x1="640" y1="410" x2="640" y2="455" stroke="#00d2ff" strokeWidth="1" />
          
          <text x="535" y="365" fill="#00d2ff" fontSize="12" fontWeight="bold">ASCA SOLUTIONS - BUILDPRO</text>
          <text x="535" y="392" fill="#00d2ff" fontSize="10">PROJECT: {projectName}</text>
          <text x="535" y="425" fill="#00d2ff" fontSize="9">LOCATION: {location}</text>
          <text x="535" y="442" fill="#00d2ff" fontSize="9">PLAN: STRUCTURAL GROUND FLOOR</text>
          <text x="648" y="425" fill="#00d2ff" fontSize="9">DATE: 2026</text>
          <text x="648" y="442" fill="#00d2ff" fontSize="9">SCALE: 1:50</text>
        </svg>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(0,210,255,0.6)', display: 'flex', justifyContent: 'space-between' }}>
        <span>* DIGITAL DOCUMENT - FOR SITE VISUALIZATION PURPOSES ONLY</span>
        <span>ID: ARQ-PLN-{projectName.substring(0,3).toUpperCase()}</span>
      </div>
    </div>
  );
};

const ContractViewer = ({ projectName, location, budget, deadline }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      padding: '2.5rem',
      color: '#e2e8f0',
      fontFamily: 'Georgia, serif',
      lineHeight: '1.6',
      maxHeight: '500px',
      overflowY: 'auto',
      boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
    }}>
      <h3 style={{ textAlign: 'center', color: '#fff', fontSize: '1.4rem', marginBottom: '2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Construction Services Contract
      </h3>
      
      <div style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        <p><strong>Issue Date:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>Contractor:</strong> ASCA Solutions LLC</p>
        <p><strong>Owner / Client:</strong> Sonia Home LLC</p>
        <p><strong>Project:</strong> {projectName}</p>
        <p><strong>Location:</strong> {location || 'Not specified'}</p>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '1.5rem 0' }} />

      <div style={{ fontSize: '0.9rem', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>
          Having gathered on one part the <strong>Contractor (ASCA Solutions LLC)</strong> and on the other the <strong>Owner (Sonia Home LLC)</strong>, they agree to formalize this agreement subject to the following clauses:
        </p>
        
        <p>
          <strong>FIRST CLAUSE (OBJECT):</strong> The Contractor agrees to provide technical direction, supervision, labor, and major structural materials supply for the project named <strong>"{projectName}"</strong>, in accordance with the architectural plans and agreed specifications.
        </p>

        <p>
          <strong>SECOND CLAUSE (VALUE AND PAYMENT METHOD):</strong> The total estimated and approved amount for the completion of the stipulated works amounts to <strong>${Number(budget || 0).toLocaleString()} USD</strong>. Payments shall be made according to the project milestone schedule established in the Official Schedule.
        </p>

        <p>
          <strong>THIRD CLAUSE (DEADLINE):</strong> The parties agree that the work will start immediately and must be fully completed by <strong>{deadline ? new Date(deadline).toLocaleDateString() : 'as estimated'}</strong>.
        </p>

        <p>
          <strong>FOURTH CLAUSE (WARRANTY):</strong> The Contractor extends a twelve (12) month warranty on the structure and foundation of the project, starting from the signing of the final receipt act.
        </p>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div style={{ textAlign: 'center', width: '45%' }}>
          <div style={{ height: '40px', borderBottom: '1px dashed rgba(255,255,255,0.3)', marginBottom: '0.5rem', color: '#3b82f6', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Sonia Home LLC (Digital Sign)
          </div>
          <span>For the Owner</span>
        </div>
        <div style={{ textAlign: 'center', width: '45%' }}>
          <div style={{ height: '40px', borderBottom: '1px dashed rgba(255,255,255,0.3)', marginBottom: '0.5rem', color: '#10b981', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ASCA Solutions LLC
          </div>
          <span>For the Contractor</span>
        </div>
      </div>
    </div>
  );
};

const EstimateViewer = ({ projectName, budget }) => {
  const cimentacion = Math.round(budget * 0.15);
  const estructura = Math.round(budget * 0.30);
  const sistemas = Math.round(budget * 0.25);
  const acabados = Math.round(budget * 0.20);
  const contingencias = Math.round(budget * 0.10);

  return (
    <div style={{
      background: 'rgba(20, 25, 35, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      color: '#fff',
    }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        Project Budget Breakdown
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <span>Project: <strong>{projectName}</strong></span>
        <span>Total Approved Budget: <strong style={{ color: '#10b981' }}>${Number(budget || 0).toLocaleString()} USD</strong></span>
      </div>

      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Category / Phase</th>
            <th style={{ textAlign: 'center', padding: '0.75rem' }}>Percentage</th>
            <th style={{ textAlign: 'right', padding: '0.75rem' }}>Assigned Amount (USD)</th>
            <th style={{ textAlign: 'left', padding: '0.75rem', paddingLeft: '1rem' }}>Item Details</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '0.75rem', fontWeight: '500' }}>Foundation & Soils</td>
            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>15%</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${cimentacion.toLocaleString()}</td>
            <td style={{ padding: '0.75rem', paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preliminary excavation, footing pouring, and test compaction.</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '0.75rem', fontWeight: '500' }}>Framing & Structure</td>
            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>30%</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${estructura.toLocaleString()}</td>
            <td style={{ padding: '0.75rem', paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wood/metal structural framing, test beams, and roof decking.</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '0.75rem', fontWeight: '500' }}>MEP Installations</td>
            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>25%</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${sistemas.toLocaleString()}</td>
            <td style={{ padding: '0.75rem', paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Piping, HVAC, test ducts, and electrical wiring.</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '0.75rem', fontWeight: '500' }}>Interior Finishes</td>
            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>20%</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${acabados.toLocaleString()}</td>
            <td style={{ padding: '0.75rem', paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Drywall walls, moldings, wood finishes, and test painting.</td>
          </tr>
          <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
            <td style={{ padding: '0.75rem', fontWeight: '500' }}>Permits & Reserves</td>
            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>10%</td>
            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${contingencias.toLocaleString()}</td>
            <td style={{ padding: '0.75rem', paddingLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Government taxes, urban licensing, and test contingency.</td>
          </tr>
          <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', fontWeight: 'bold' }}>
            <td style={{ padding: '0.75rem', color: '#10b981' }}>TOTAL BUDGET</td>
            <td style={{ textAlign: 'center', color: '#10b981' }}>100%</td>
            <td style={{ textAlign: 'right', color: '#10b981' }}>${budget.toLocaleString()}</td>
            <td style={{ padding: '0.75rem', paddingLeft: '1rem', fontSize: '0.85rem', color: '#10b981' }}>Final estimated investment for the project.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const PermitViewer = ({ fileName, projectName, location, fileId }) => {
  return (
    <div style={{
      background: '#131924',
      border: '2px double rgba(16, 185, 129, 0.4)',
      borderRadius: '0.5rem',
      padding: '2.5rem',
      color: '#e2e8f0',
      fontFamily: 'Courier New, monospace',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 0 30px rgba(16,185,129,0.03)'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '120px',
        height: '120px',
        border: '3px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '50%',
        color: 'rgba(16, 185, 129, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(15deg)',
        fontWeight: 'bold',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        pointerEvents: 'none'
      }}>
        <span>Approved</span>
        <span style={{ fontSize: '0.6rem', margin: '3px 0' }}>Local Government</span>
        <span style={{ fontSize: '0.7rem' }}>2026</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: '#10b981', fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
          METROPOLITAN GOVERNMENT - DEPARTMENT OF WORKS
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          OFFICIAL CONSTRUCTION AND PLANNING LICENSE
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
        <div><strong>PERMIT CODE:</strong> <span style={{ color: '#10b981' }}>PERMIT-{fileId?.substring(0,8).toUpperCase() || '2026-X9'}</span></div>
        <div><strong>ATTACHED DOCUMENT:</strong> {fileName}</div>
        <div><strong>AUTHORIZED PROJECT:</strong> {projectName}</div>
        <div><strong>CONSTRUCTION SITE LOCATION:</strong> {location || 'Not specified'}</div>
        <div><strong>LICENSE STATUS:</strong> <span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>CURRENT & ACTIVE</span></div>
      </div>

      <hr style={{ border: '0', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', margin: '1.5rem 0' }} />

      <div style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
        <p>
          This document constitutes the construction authorization corresponding to the files approved under residential construction regulations. The project management must ensure that the stamped structural plans are physically available for any routine technical inspection.
        </p>
      </div>

      <div style={{ marginTop: '3rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Issued: {new Date().toLocaleDateString()}</span>
        <span>Verification QR Code: [AUTHORIZED]</span>
      </div>
    </div>
  );
};

const Documents = ({ activeProjectId, onSelectProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);

  // Form state
  const [newDoc, setNewDoc] = useState({
    file: null,
    category: '',
    project_id: ''
  });

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          projects ( name, budget, location, deadline )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setFiles(data);
    } catch (error) {
      console.error('Error fetching documents:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name');
    if (data) setProjects(data);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newDoc.file || !newDoc.category || !newDoc.project_id) return;

    try {
      setLoading(true);
      let fileUrl = '#';
      
      const fileExt = newDoc.file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${newDoc.project_id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, newDoc.file);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        fileUrl = publicUrlData.publicUrl;
      } else {
        console.warn('Storage upload failed (bucket might not exist). Saving metadata only.', uploadError.message);
      }

      // Save document metadata
      const { error } = await supabase
        .from('documents')
        .insert([
          { 
            name: newDoc.file.name, 
            category: newDoc.category,
            project_id: newDoc.project_id,
            size_mb: (newDoc.file.size / (1024 * 1024)).toFixed(2),
            file_type: newDoc.file.type.includes('pdf') ? 'PDF' : newDoc.file.type.includes('image') ? 'Image' : 'Other',
            file_url: fileUrl
          }
        ]);

      if (error) throw error;
      
      alert(uploadError ? 'Document metadata saved. (Storage upload failed - please check "documents" bucket)' : 'Document uploaded successfully!');
      setIsModalOpen(false);
      setNewDoc({ file: null, category: '', project_id: '' });
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error uploading:', error.message);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (e, file) => {
    if (file.file_url && file.file_url !== '#') {
      // Let browser open target="_blank"
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    let content = '';
    let mimeType = 'text/plain';
    let filename = file.name || 'document.txt';
    
    const projName = file.projects?.name || 'All Projects';
    const projLocation = file.projects?.location || 'Not specified';
    const projBudget = file.projects?.budget || 100000;
    const projDeadline = file.projects?.deadline || null;
    
    if (file.category === 'Blueprints') {
      mimeType = 'image/svg+xml';
      filename = filename.endsWith('.svg') ? filename : filename.replace(/\.[^/.]+$/, "") + ".svg";
      content = getBlueprintSVG(projName, projLocation);
    } else if (file.category === 'Contracts') {
      mimeType = 'text/plain';
      filename = filename.endsWith('.txt') ? filename : filename.replace(/\.[^/.]+$/, "") + ".txt";
      content = getContractText(projName, projLocation, projBudget, projDeadline);
    } else if (file.category === 'Estimates') {
      mimeType = 'text/csv';
      filename = filename.endsWith('.csv') ? filename : filename.replace(/\.[^/.]+$/, "") + ".csv";
      content = getEstimateCSV(projName, projBudget);
    } else {
      mimeType = 'text/plain';
      filename = filename.endsWith('.txt') ? filename : filename.replace(/\.[^/.]+$/, "") + ".txt";
      content = getGeneralPermitText(file.name, projName, projLocation);
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categories = ['All', 'Estimates', 'Invoices', 'Purchases', 'Sales', 'Contracts', 'Blueprints', 'Other'];

  // Apply filters
  const filteredFiles = files.filter(f => {
    const matchesCategory = filterCategory === 'All' || f.category === filterCategory;
    const matchesProject = !activeProjectId || activeProjectId === 'all' || f.project_id === activeProjectId;
    return matchesCategory && matchesProject;
  });

  return (
    <div className="documents-container" style={{ position: 'relative' }}>
      <div className="content-card glass">
        <div className="card-header">
          <h2>Document Management</h2>
          <div className="header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
              <Filter size={18} color="var(--text-muted)" />
              <select 
                className="form-input" 
                style={{ padding: '0.5rem', width: 'auto' }}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => {
                setNewDoc({
                  file: null,
                  category: '',
                  project_id: (activeProjectId && activeProjectId !== 'all') ? activeProjectId : ''
                });
                setIsModalOpen(true);
              }}
            >
              <Upload size={18} />
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading documents...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Category</th>
                <th>Project</th>
                <th>Size (MB)</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No documents found.</td>
                </tr>
              ) : (
                filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                          <File size={20} color={
                            file.file_type === 'PDF' ? 'var(--danger-color)' : 
                            file.file_type === 'Excel' ? 'var(--secondary-color)' : 'var(--primary-color)'
                          } />
                        </div>
                        <span 
                          style={{ 
                            fontWeight: 500, 
                            cursor: 'pointer', 
                            borderBottom: '1px dashed var(--primary-color)',
                            color: 'var(--text-main)'
                          }}
                          onClick={() => setSelectedPreviewFile(file)}
                          title="Click to Preview"
                        >
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-main)' }}>
                        {file.category}
                      </span>
                    </td>
                    <td>{file.projects?.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{file.size_mb} MB</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(file.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* Visualizer Eye Button */}
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem', display: 'inline-flex' }}
                          onClick={() => setSelectedPreviewFile(file)}
                          title="Preview Document"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Download Trigger */}
                        {file.file_url && file.file_url !== '#' ? (
                          <a 
                            href={file.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem', display: 'inline-flex', textDecoration: 'none' }}
                            title="Download actual file"
                          >
                            <Download size={18} />
                          </a>
                        ) : (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem', display: 'inline-flex' }}
                            onClick={(e) => handleDownload(e, file)}
                            title="Download simulated file"
                          >
                            <Download size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="content-card glass" style={{ width: '450px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Upload New Document</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label className="form-label">File</label>
                <input 
                  type="file" 
                  className="form-input" 
                  required 
                  onChange={(e) => setNewDoc({...newDoc, file: e.target.files[0]})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Category</label>
                <select 
                  className="form-input" 
                  required
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                >
                  <option value="">Select type...</option>
                  <option value="Estimates">Estimate</option>
                  <option value="Invoices">Invoice</option>
                  <option value="Purchases">Purchase Order</option>
                  <option value="Sales">Sales Receipt</option>
                  <option value="Contracts">Contract</option>
                  <option value="Blueprints">Technical Blueprints</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Related Project</label>
                <select 
                  className="form-input" 
                  required
                  value={newDoc.project_id}
                  onChange={(e) => setNewDoc({...newDoc, project_id: e.target.value})}
                >
                  <option value="">Select project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Upload size={18} /> Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visualizer Modal */}
      {selectedPreviewFile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '1rem'
        }}>
          <div className="content-card glass" style={{ 
            width: '100%', 
            maxWidth: '850px', 
            padding: '2rem',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                  <File size={24} color="var(--primary-color)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedPreviewFile.name}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category: {selectedPreviewFile.category}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPreviewFile(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {selectedPreviewFile.category === 'Blueprints' && (
                <BlueprintViewer 
                  projectName={selectedPreviewFile.projects?.name || 'All Projects'} 
                  location={selectedPreviewFile.projects?.location || 'Not specified'} 
                />
              )}
              {selectedPreviewFile.category === 'Contracts' && (
                <ContractViewer 
                  projectName={selectedPreviewFile.projects?.name || 'All Projects'} 
                  location={selectedPreviewFile.projects?.location || 'Not specified'} 
                  budget={selectedPreviewFile.projects?.budget || 100000}
                  deadline={selectedPreviewFile.projects?.deadline}
                />
              )}
              {selectedPreviewFile.category === 'Estimates' && (
                <EstimateViewer 
                  projectName={selectedPreviewFile.projects?.name || 'All Projects'} 
                  budget={selectedPreviewFile.projects?.budget || 100000}
                />
              )}
              {!['Blueprints', 'Contracts', 'Estimates'].includes(selectedPreviewFile.category) && (
                <PermitViewer 
                  fileName={selectedPreviewFile.name}
                  projectName={selectedPreviewFile.projects?.name || 'All Projects'} 
                  location={selectedPreviewFile.projects?.location || 'Not specified'} 
                  fileId={selectedPreviewFile.id}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedPreviewFile(null)}>
                Close
              </button>
              
              {selectedPreviewFile.file_url && selectedPreviewFile.file_url !== '#' ? (
                <a 
                  href={selectedPreviewFile.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary" 
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download size={18} /> Download Real
                </a>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={(e) => handleDownload(e, selectedPreviewFile)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download size={18} /> Download Simulated
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
