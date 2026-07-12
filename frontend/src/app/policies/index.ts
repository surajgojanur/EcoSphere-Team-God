export type Policy = {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: string;
  purpose: string;
  scope: string;
  policyStatement: string;
  employeeResponsibilities: string;
  managerResponsibilities: string;
  complianceRequirements: string;
  exceptions: string;
  reviewFrequency: string;
  approvalAuthority: string;
};

export const policies: Policy[] = [
  {
    id: "ESG-001",
    title: "Carbon Emissions Reporting",
    category: "Environmental",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Establish transparent and consistent reporting of Scope 1, Scope 2, and material Scope 3 greenhouse gas emissions to support EcoSphere’s corporate sustainability commitments and regulatory filings.",
    scope:
      "Applies to all EcoSphere business units, owned and leased facilities under operational control, and contracted service providers whose emissions data are consolidated into the corporate sustainability report.",
    policyStatement:
      "EcoSphere commits to capturing, verifying, and reporting emissions data in accordance with the GHG Protocol and applicable jurisdictional requirements. All material emissions sources must be identified, documented, and subject to internal review before publication.",
    employeeResponsibilities:
      "Provide accurate activity data, submit emissions reports on schedule, follow data collection procedures, and notify the Sustainability Office of discrepancies or missing information.",
    managerResponsibilities:
      "Review and approve emissions submissions from assigned teams, enforce documentation standards, support data verification activities, and escalate unresolved issues to the Environmental Compliance Lead.",
    complianceRequirements:
      "Reporting must meet EcoSphere’s internal annual emissions deadlines, third-party assurance standards, and any local mandatory emissions disclosure obligations.",
    exceptions:
      "Exceptions may be granted only by the Chief Sustainability Officer for documented data collection limitations or regulatory conflicts, with a written mitigation plan.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Sustainability Officer"
  },
  {
    id: "ESG-002",
    title: "Energy Management",
    category: "Environmental",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Define requirements for reducing energy intensity, monitoring energy use, and strengthening energy efficiency across EcoSphere facilities and operations.",
    scope:
      "This policy applies to all EcoSphere-managed offices, production sites, warehouses, and field locations that consume electricity, fuel, or thermal energy under company control.",
    policyStatement:
      "EcoSphere will optimize energy consumption by implementing efficiency measures, tracking performance, and targeting reductions in line with corporate sustainability goals. Energy use will be measured monthly and reported through the enterprise energy management system.",
    employeeResponsibilities:
      "Observe facility energy guidelines, report inefficient equipment or HVAC usage, participate in energy awareness campaigns, and conserve resources in daily operations.",
    managerResponsibilities:
      "Set energy performance targets for their sites, maintain energy monitoring systems, prioritize efficiency projects, and ensure capital plans align with energy reduction objectives.",
    complianceRequirements:
      "Sites must comply with local energy codes, EcoSphere energy performance targets, and internal energy reporting protocols.",
    exceptions:
      "Temporary exceptions for critical process reliability may be approved by the Director of Facilities with a documented action plan to restore efficiency.",
    reviewFrequency: "Biennial",
    approvalAuthority: "Director of Facilities"
  },
  {
    id: "ESG-003",
    title: "Waste Management",
    category: "Environmental",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Establish standard expectations for reducing, segregating, and disposing of waste to minimize EcoSphere’s environmental footprint and support responsible resource recovery.",
    scope:
      "Applies to all staff, contractors, and visitors at EcoSphere offices, production facilities, and shared workspaces where waste is generated or managed.",
    policyStatement:
      "EcoSphere will reduce waste generation through source reduction, reuse, and recycling. Waste streams must be separated, tracked, and sent to authorized recovery or disposal partners in accordance with applicable laws.",
    employeeResponsibilities:
      "Use designated waste and recycling containers, minimize disposables, report contamination concerns, and follow waste handling instructions in their workplace.",
    managerResponsibilities:
      "Maintain clear waste separation signage, ensure access to proper disposal infrastructure, monitor waste reduction progress, and partner with operations to identify reuse opportunities.",
    complianceRequirements:
      "Waste handling must follow local environmental regulations, EcoSphere waste management procedures, and vendor audit requirements for waste contractors.",
    exceptions:
      "Exceptions for site-specific waste streams require review and approval from the Environmental Compliance Lead with documented waste management controls.",
    reviewFrequency: "Annual",
    approvalAuthority: "Environmental Compliance Lead"
  },
  {
    id: "ESG-004",
    title: "Water Conservation",
    category: "Environmental",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Define actions to manage water use responsibly, protect local water resources, and reduce the risk of water-related operational impact.",
    scope:
      "This policy applies to all owned and leased EcoSphere facilities, manufacturing sites, and field operations with measurable water use.",
    policyStatement:
      "EcoSphere will monitor water consumption, implement conservation measures, and avoid unnecessary water use. Water quality and withdrawal permits will be managed proactively in each jurisdiction.",
    employeeResponsibilities:
      "Adopt water-saving practices, report leaks or inefficient fixtures, and cooperate with conservation initiatives at their location.",
    managerResponsibilities:
      "Track water consumption metrics, lead local conservation projects, maintain permit compliance, and include water risk considerations in capital plans.",
    complianceRequirements:
      "All sites must meet regional water withdrawal permits, EcoSphere water use targets, and reporting requirements defined by the Sustainability Office.",
    exceptions:
      "Operational exceptions are permitted only for essential safety or process needs and require documented justification and mitigation from site leadership.",
    reviewFrequency: "Biennial",
    approvalAuthority: "Director of Operations"
  },
  {
    id: "ESG-005",
    title: "Sustainable Procurement",
    category: "Environmental",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Guide procurement decisions toward suppliers, products, and services that reduce EcoSphere’s environmental impact and support sustainable supply chain performance.",
    scope:
      "Applies to all procurement staff, contract managers, and business units procuring goods and services that materially affect EcoSphere’s environmental footprint.",
    policyStatement:
      "EcoSphere will prioritize suppliers with proven sustainability practices, favor low-impact materials, and require environmental performance criteria in tender and contract evaluations.",
    employeeResponsibilities:
      "Use EcoSphere procurement tools to evaluate supplier sustainability, request environmental documentation, and raise concerns about supplier practices.",
    managerResponsibilities:
      "Incorporate sustainability criteria into procurement strategies, review supplier performance, and approve sourcing decisions consistent with this policy.",
    complianceRequirements:
      "Supplier selection and contracting must follow EcoSphere procurement guidelines, ESG due diligence standards, and applicable anti-corruption laws.",
    exceptions:
      "Non-compliant procurement exceptions may be approved only by the Chief Procurement Officer when no sustainable alternative exists and risk mitigation is documented.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Procurement Officer"
  },
  {
    id: "ESG-006",
    title: "Environmental Incident Reporting",
    category: "Environmental",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Ensure timely notification, investigation, and corrective action for environmental incidents to limit harm and preserve EcoSphere’s compliance and reputation.",
    scope:
      "Applies to all employees, contractors, and visitors who observe or are involved in events with actual or potential environmental impact at EcoSphere facilities or operations.",
    policyStatement:
      "All environmental incidents, near misses, and non-compliance events must be reported immediately through the EcoSphere incident management system. Incidents will be reviewed and remediated promptly.",
    employeeResponsibilities:
      "Report incidents without delay, cooperate with incident investigations, and apply immediate containment actions when safe to do so.",
    managerResponsibilities:
      "Confirm incident reports, coordinate response actions, lead root cause analysis, and ensure corrective actions are implemented and monitored.",
    complianceRequirements:
      "Incident reporting must satisfy internal notification timelines, permit reporting obligations, and any regulatory requirements for environmental spill or release notifications.",
    exceptions:
      "No exceptions are permitted for incident reporting. All potential environmental impacts must be reported as required by this policy.",
    reviewFrequency: "Annual",
    approvalAuthority: "Environmental Compliance Lead"
  },
  {
    id: "ESG-007",
    title: "Climate Risk Management",
    category: "Environmental",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Embed climate-related risk assessment into business planning to protect EcoSphere from transition and physical climate risks.",
    scope:
      "This policy applies to strategic planning, capital allocation, supply chain management, and asset risk assessments across EcoSphere global operations.",
    policyStatement:
      "EcoSphere will identify, assess, and mitigate climate risks that may affect our operations, assets, supply chain, and reputation. Climate risk factors will inform long-term planning and reporting.",
    employeeResponsibilities:
      "Incorporate climate risk considerations into project proposals, provide requested risk assessments, and participate in climate resilience training.",
    managerResponsibilities:
      "Ensure climate risk evaluations are included in business unit plans, review mitigation strategies, and report material climate risks to enterprise risk management.",
    complianceRequirements:
      "Climate risk assessments must adhere to EcoSphere risk management standards and any regulatory disclosure requirements relevant to the business unit.",
    exceptions:
      "Exceptions for climate risk screening may be approved only by the Chief Risk Officer with a documented rationale and compensating controls.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Risk Officer"
  },
  {
    id: "SOC-001",
    title: "Code of Conduct",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Define the ethical standards and professional behaviors expected of all EcoSphere employees, contractors, and representatives.",
    scope:
      "Applies to all employees, directors, contractors, temporary staff, and third parties acting on EcoSphere’s behalf globally.",
    policyStatement:
      "EcoSphere expects individuals to act with integrity, respect, and accountability in all relationships. Business decisions must align with company values, applicable laws, and ethical conduct.",
    employeeResponsibilities:
      "Review and acknowledge the Code of Conduct annually, speak up when they observe violations, and apply ethical judgment in their daily work.",
    managerResponsibilities:
      "Model ethical behavior, support employees who raise concerns, enforce the Code consistently, and address misconduct promptly.",
    complianceRequirements:
      "All employees must complete required Code of Conduct training and report suspected violations through approved channels.",
    exceptions:
      "No exceptions are permitted to the fundamental expectations of ethical behavior set forth in this policy.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Human Resources Officer"
  },
  {
    id: "SOC-002",
    title: "Diversity & Inclusion",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Promote an inclusive workplace where diverse perspectives are respected, valued, and integrated into EcoSphere’s culture and decision-making.",
    scope:
      "Applies to all employees, contractors, managers, and recruiters involved in talent acquisition, development, and employee engagement.",
    policyStatement:
      "EcoSphere will foster diversity in hiring, retention, career development, and leadership. Inclusive practices are required across recruitment, performance reviews, and employee engagement programs.",
    employeeResponsibilities:
      "Treat colleagues with respect, participate in inclusion training, and advocate for equitable opportunities across teams.",
    managerResponsibilities:
      "Ensure recruitment and promotion decisions are based on merit, remove bias from team discussions, and support diverse talent development.",
    complianceRequirements:
      "Diversity and inclusion initiatives must align with human rights laws and internal equity metrics, with progress tracked by HR.",
    exceptions:
      "Exceptions are not permitted for core diversity and inclusion commitments. Specific accommodations may be provided through established HR processes.",
    reviewFrequency: "Biennial",
    approvalAuthority: "Chief Human Resources Officer"
  },
  {
    id: "SOC-003",
    title: "Equal Opportunity",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Ensure fair treatment and equal access to employment opportunities for all individuals, without discrimination on protected characteristics.",
    scope:
      "Applies to recruitment, hiring, compensation, training, promotion, performance management, and employment separation for all EcoSphere personnel.",
    policyStatement:
      "EcoSphere provides equal opportunity in employment. Decisions are made without regard to race, color, religion, gender, age, disability, sexual orientation, or other protected characteristics.",
    employeeResponsibilities:
      "Treat all colleagues fairly, refrain from discriminatory conduct, and support a workplace that values diversity and inclusion.",
    managerResponsibilities:
      "Apply consistent selection criteria, document objective decision-making, investigate any allegations of discrimination, and enforce equal opportunity practices.",
    complianceRequirements:
      "Hiring and promotion processes must comply with applicable equal opportunity regulations and internal standards for nondiscrimination.",
    exceptions:
      "Limited legal exceptions may apply for bona fide occupational qualifications, subject to review by Legal and HR.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Human Resources Officer"
  },
  {
    id: "SOC-004",
    title: "Anti-Harassment",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Maintain a respectful workplace free from harassment, bullying, or retaliation for employees, contractors, and visitors.",
    scope:
      "Applies to all interactions in EcoSphere workplaces, field sites, virtual meetings, sponsored events, and business travel.",
    policyStatement:
      "Harassment of any kind is prohibited. EcoSphere will investigate all reports promptly and take corrective action when improper conduct is confirmed.",
    employeeResponsibilities:
      "Respect colleagues, avoid inappropriate behavior, report harassment concerns promptly, and cooperate fully with investigations.",
    managerResponsibilities:
      "Create a safe environment for reporting, take allegations seriously, support affected employees, and ensure timely investigation and resolution.",
    complianceRequirements:
      "Reports must be handled through approved channels and in accordance with local workplace harassment regulations and company procedures.",
    exceptions:
      "No exceptions are permitted for the prohibition against harassment and retaliation.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Human Resources Officer"
  },
  {
    id: "SOC-005",
    title: "Employee Health & Safety",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Protect employee health and safety by establishing requirements for hazard identification, emergency preparedness, and safe working practices.",
    scope:
      "Applies to all EcoSphere employees, contractors, vendors, and visitors at company-owned or operated sites worldwide.",
    policyStatement:
      "EcoSphere will provide safe working conditions, comply with occupational health and safety regulations, and continuously improve safety performance through risk reduction and training.",
    employeeResponsibilities:
      "Follow safety procedures, use required personal protective equipment, report hazards immediately, and participate in safety training.",
    managerResponsibilities:
      "Maintain safe work environments, conduct hazard assessments, enforce safety rules, and respond to incidents with corrective action.",
    complianceRequirements:
      "Safety practices must meet applicable laws, internal safety standards, and any client-specific contractual requirements.",
    exceptions:
      "Operational exceptions may be granted only for documented safety-critical work under controlled conditions and with written authorization from the Health & Safety Director.",
    reviewFrequency: "Annual",
    approvalAuthority: "Director of Health & Safety"
  },
  {
    id: "SOC-006",
    title: "Remote Work",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Define expectations for remote work to support productivity, security, and employee wellbeing across distributed EcoSphere teams.",
    scope:
      "Applies to eligible employees, managers, and contractors authorized to perform work outside of EcoSphere facilities.",
    policyStatement:
      "Remote work arrangements are permitted when they support business needs and maintain security, collaboration, and service quality. Remote employees must meet performance expectations and comply with company policies.",
    employeeResponsibilities:
      "Maintain a reliable work environment, protect company information, stay available during agreed hours, and report remote work challenges to their manager.",
    managerResponsibilities:
      "Assess remote work eligibility, monitor performance, ensure remote teams have the resources and guidance they need, and confirm adherence to security and collaboration standards.",
    complianceRequirements:
      "Remote work arrangements must comply with local employment laws, tax requirements, and relevant company policies including information security.",
    exceptions:
      "Exceptions to remote work availability are managed by local HR based on business needs, legal restrictions, or site requirements.",
    reviewFrequency: "Biennial",
    approvalAuthority: "Chief Human Resources Officer"
  },
  {
    id: "SOC-007",
    title: "CSR Participation",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Encourage employee engagement in corporate social responsibility initiatives that align with EcoSphere’s community, environmental, and social goals.",
    scope:
      "Applies to all employees, volunteers, and team leaders participating in company-sponsored CSR programs and community service activities.",
    policyStatement:
      "EcoSphere supports CSR participation by providing paid volunteer time, recognizing contributions, and ensuring activities align with ethical, safety, and environmental standards.",
    employeeResponsibilities:
      "Register for CSR activities through the company platform, follow event guidelines, and represent EcoSphere with professionalism.",
    managerResponsibilities:
      "Approve CSR participation requests, ensure team members understand expectations, and recognize contributions during performance discussions.",
    complianceRequirements:
      "CSR activities must comply with EcoSphere’s safety, ethics, and community engagement standards, including any local event permits.",
    exceptions:
      "Exceptions for participation time may be granted for business-critical work with manager approval and consideration of employee wellbeing.",
    reviewFrequency: "Annual",
    approvalAuthority: "Vice President of Corporate Affairs"
  },
  {
    id: "SOC-008",
    title: "Community Engagement",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Guide EcoSphere’s relationships with local communities and stakeholders to build trust, support shared value, and deliver measurable social impact.",
    scope:
      "Applies to all community-facing activities, partnerships, sponsorships, and stakeholder engagement conducted by EcoSphere business units.",
    policyStatement:
      "EcoSphere will engage communities respectfully, respond to local needs, and integrate community feedback into program design and decision-making.",
    employeeResponsibilities:
      "Collaborate with community engagement teams, respect local customs, and escalate stakeholder concerns to the appropriate business owner.",
    managerResponsibilities:
      "Ensure community activities are aligned with company principles, obtain necessary approvals, and track outcomes against engagement objectives.",
    complianceRequirements:
      "Community engagement programs must comply with local laws, company ethics standards, and internal partnership approval procedures.",
    exceptions:
      "Exceptions require approval from Corporate Affairs for activities that deviate from standard community engagement guidelines.",
    reviewFrequency: "Annual",
    approvalAuthority: "Vice President of Corporate Affairs"
  },
  {
    id: "SOC-009",
    title: "Employee Learning & Development",
    category: "Social",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Support continuous employee development through training, career planning, and capability building that strengthens EcoSphere’s ESG performance and business agility.",
    scope:
      "Applies to all EcoSphere employees and managers responsible for training plans, performance development, and learning investments.",
    policyStatement:
      "EcoSphere will provide learning opportunities that support employee growth, compliance, leadership, and ESG competencies. Development plans should be equitable and aligned with strategic priorities.",
    employeeResponsibilities:
      "Engage in assigned learning, complete mandatory training, seek development opportunities, and discuss career goals with their manager.",
    managerResponsibilities:
      "Help employees identify relevant development activities, support learning assignments, and ensure training completion for compliance topics.",
    complianceRequirements:
      "Mandatory training requirements must be completed by the deadlines established by HR and business compliance leads.",
    exceptions:
      "Training completion exceptions are handled by HR for documented leaves or extraordinary business obligations.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Human Resources Officer"
  },
  {
    id: "GOV-001",
    title: "Information Security",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Protect EcoSphere information assets by defining security controls, access requirements, and incident responsibilities for all systems and data.",
    scope:
      "Applies to all employees, contractors, third parties, and systems that create, store, access, or transmit EcoSphere information.",
    policyStatement:
      "EcoSphere will secure information assets through risk-based controls, strong authentication, data classification, and continuous monitoring. Security incidents must be reported immediately.",
    employeeResponsibilities:
      "Protect credentials, follow acceptable use rules, report suspected breaches, and complete required security awareness training.",
    managerResponsibilities:
      "Authorize appropriate access levels, enforce security requirements, and ensure team members comply with information security controls.",
    complianceRequirements:
      "Information security practices must align with internal security standards, contractual obligations, and relevant regulatory frameworks.",
    exceptions:
      "Security exceptions may be granted only by the Chief Information Security Officer after formal risk assessment and documented compensating controls.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Information Security Officer"
  },
  {
    id: "GOV-002",
    title: "Data Privacy",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Ensure responsible handling of personal data, protect individual privacy rights, and meet global privacy obligations for EcoSphere’s employees, customers, and partners.",
    scope:
      "Applies to all processing of personal data, including collection, storage, use, disclosure, retention, and disposal across EcoSphere operations.",
    policyStatement:
      "EcoSphere will process personal data lawfully, transparently, and only for legitimate business purposes. Privacy rights must be respected and data subject requests handled promptly.",
    employeeResponsibilities:
      "Handle personal data in accordance with privacy principles, minimize data collection, and report privacy incidents immediately.",
    managerResponsibilities:
      "Ensure teams understand applicable privacy requirements, maintain records of processing activities, and support privacy assessments.",
    complianceRequirements:
      "Processing of personal data must comply with GDPR, CCPA, other applicable privacy laws, and EcoSphere privacy standards.",
    exceptions:
      "Privacy exceptions are permitted only when necessary for legal obligations or safety, with approval by the Data Protection Officer.",
    reviewFrequency: "Annual",
    approvalAuthority: "Data Protection Officer"
  },
  {
    id: "GOV-003",
    title: "Cybersecurity",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Set standards for defending EcoSphere systems and networks from cyber threats through prevention, detection, and response capabilities.",
    scope:
      "Applies to all digital infrastructure, endpoints, cloud services, network components, applications, and personnel with cybersecurity responsibilities.",
    policyStatement:
      "EcoSphere will maintain an active cybersecurity program that protects critical assets, reduces vulnerability exposure, and responds rapidly to incidents.",
    employeeResponsibilities:
      "Report suspicious activity, apply security updates, comply with access restrictions, and complete cybersecurity training.",
    managerResponsibilities:
      "Ensure systems under their control are patched, review cybersecurity posture, and coordinate with the Security Operations Center.",
    complianceRequirements:
      "Cybersecurity controls must meet internal security baselines, industry best practices, and contractual obligations related to cyber risk.",
    exceptions:
      "Exceptions may be granted for legacy systems only when evaluated by cybersecurity and documented with mitigation measures.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Information Security Officer"
  },
  {
    id: "GOV-004",
    title: "Risk Management",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Provide a consistent framework for identifying, assessing, and managing strategic, operational, financial, and ESG-related risks across EcoSphere.",
    scope:
      "Applies to all business units, functions, and risk owners responsible for enterprise risk assessment and mitigation activities.",
    policyStatement:
      "EcoSphere will use a common risk taxonomy and risk rating methodology to manage risk exposure. Material risks must be identified, owned, and reported to executive leadership.",
    employeeResponsibilities:
      "Report emerging risks, participate in risk assessments, and follow approved mitigation plans within their area of responsibility.",
    managerResponsibilities:
      "Lead risk assessments for their business area, validate control effectiveness, and escalate material risks according to the risk governance process.",
    complianceRequirements:
      "Risk management activities must comply with EcoSphere governance standards, risk reporting cycles, and any regulatory risk frameworks that apply to the business.",
    exceptions:
      "Exceptions to risk management requirements require approval from the Chief Risk Officer and a documented rationale.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Risk Officer"
  },
  {
    id: "GOV-005",
    title: "Internal Audit",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Clarify the purpose, independence, and responsibilities of the internal audit function in evaluating EcoSphere’s controls, risk management, and governance processes.",
    scope:
      "Applies to all EcoSphere operations, governance processes, financial controls, and ESG compliance programs subject to internal audit review.",
    policyStatement:
      "The internal audit function will operate independently and objectively, providing assurance and recommendations to the Audit Committee and executive leadership.",
    employeeResponsibilities:
      "Facilitate audit requests, provide documentation, and support auditors in understanding business processes and control environments.",
    managerResponsibilities:
      "Respond to audit findings, implement agreed corrective actions, and provide timely status updates to the internal audit team.",
    complianceRequirements:
      "Internal audit activities must follow EcoSphere audit charters, professional standards, and any regulatory audit requirements.",
    exceptions:
      "Exceptions are not permitted for internal audit access and cooperation requirements.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Audit Executive"
  },
  {
    id: "GOV-006",
    title: "Whistleblower Protection",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Protect individuals who report wrongdoing and ensure that reports of misconduct are investigated impartially and without retaliation.",
    scope:
      "Applies to all employees, contractors, vendors, and third parties who report concerns about fraud, ethics violations, safety issues, or regulatory non-compliance.",
    policyStatement:
      "EcoSphere prohibits retaliation against anyone who reports concerns in good faith. Reports will be reviewed confidentially and investigated by qualified individuals.",
    employeeResponsibilities:
      "Report concerns through approved channels, provide truthful information, and cooperate with investigations as requested.",
    managerResponsibilities:
      "Support employees who make reports, refrain from retaliatory actions, and escalate any management concerns about investigations.",
    complianceRequirements:
      "Whistleblower protections must align with applicable protections, reporting procedures, and corporate ethics standards.",
    exceptions:
      "Retaliation protections do not extend to knowingly false reports made with malicious intent.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Legal Officer"
  },
  {
    id: "GOV-007",
    title: "Anti-Bribery & Anti-Corruption",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Prevent bribery and corruption in EcoSphere’s business activities and strengthen controls over gifts, hospitality, third parties, and government interactions.",
    scope:
      "Applies to all employees, directors, agents, consultants, and third-party representatives acting on EcoSphere’s behalf.",
    policyStatement:
      "EcoSphere prohibits bribery and corruption in all forms. Gifts, hospitality, and payments must be lawful, properly authorized, and transparent.",
    employeeResponsibilities:
      "Decline improper offers, seek approval for allowable gifts, report suspicious requests, and participate in anti-corruption training.",
    managerResponsibilities:
      "Review approvals for gifts and hospitality, ensure third-party due diligence is conducted, and enforce anti-corruption controls.",
    complianceRequirements:
      "All activities must comply with anti-bribery laws, EcoSphere’s anti-corruption procedures, and contractual requirements.",
    exceptions:
      "Limited exceptions for nominal gifts are permitted with prior approval as defined in the Anti-Bribery Procedures.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Legal Officer"
  },
  {
    id: "GOV-008",
    title: "Conflict of Interest",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Ensure that personal, financial, or familial interests do not improperly influence EcoSphere decision-making.",
    scope:
      "Applies to all employees, officers, directors, and contractors who may have a relationship, interest, or activity that could conflict with company interests.",
    policyStatement:
      "EcoSphere requires disclosure of actual or potential conflicts of interest. Transaction approvals and business decisions must be made free from improper personal influence.",
    employeeResponsibilities:
      "Disclose conflicts promptly, recuse themselves from related decisions, and update disclosures when circumstances change.",
    managerResponsibilities:
      "Review conflict disclosures, determine appropriate mitigation, and ensure conflicted individuals do not participate in related decisions.",
    complianceRequirements:
      "Conflict disclosures must be maintained through the company’s disclosure process and reviewed by the Legal and Compliance teams.",
    exceptions:
      "Exceptions are rare and require formal approval from the Chief Legal Officer with documented mitigation measures.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Legal Officer"
  },
  {
    id: "GOV-009",
    title: "Vendor Compliance",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Establish expectations for vendor conduct, performance, and compliance across EcoSphere’s supply chain relationships.",
    scope:
      "Applies to all vendors, suppliers, contractors, and third-party partners providing goods or services to EcoSphere.",
    policyStatement:
      "EcoSphere will engage vendors that commit to lawful, ethical, and sustainable practices. Vendors are expected to comply with EcoSphere standards, contractual obligations, and applicable laws.",
    employeeResponsibilities:
      "Evaluate vendor compliance during selection, enforce contractual requirements, and report concerns about vendor conduct.",
    managerResponsibilities:
      "Confirm vendor compliance due diligence, monitor ongoing performance, and take action when vendors fail to meet standards.",
    complianceRequirements:
      "Vendor relationships must include contractual compliance obligations, periodic assessments, and remediation plans as required.",
    exceptions:
      "Vendor compliance exceptions require approval from the Procurement Compliance team and a documented risk mitigation plan.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Procurement Officer"
  },
  {
    id: "GOV-010",
    title: "Procurement Ethics",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Define the highest ethical standards for procurement activities, ensuring fairness, transparency, and accountability in supplier selection.",
    scope:
      "Applies to all procurement professionals, sourcing teams, contract negotiators, and business leaders involved in supplier selection.",
    policyStatement:
      "EcoSphere will procure goods and services through fair, competitive, and transparent processes. Procurement decisions must be free from favoritism, conflicts of interest, and improper influence.",
    employeeResponsibilities:
      "Follow established procurement procedures, disclose personal interests, and document supplier selection rationales clearly.",
    managerResponsibilities:
      "Oversee procurement integrity, review exceptions carefully, and ensure sourcing decisions are based on business value and compliance.",
    complianceRequirements:
      "Procurement activities must comply with EcoSphere sourcing policies, applicable laws, and internal approval thresholds.",
    exceptions:
      "Limited exceptions to procurement processes may be authorized only for emergency requirements and require review by Procurement Governance.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Procurement Officer"
  },
  {
    id: "GOV-011",
    title: "Business Continuity",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Describe the requirements for planning, testing, and maintaining continuity capabilities to protect EcoSphere operations during disruptions.",
    scope:
      "Applies to all business units, critical functions, and sites with responsibilities for maintaining continuity and recovery capabilities.",
    policyStatement:
      "EcoSphere will identify critical processes, develop continuity plans, and test recovery procedures regularly to minimize disruption to customers and stakeholders.",
    employeeResponsibilities:
      "Understand their role in continuity plans, participate in exercises when requested, and follow incident response guidance during disruptions.",
    managerResponsibilities:
      "Identify critical dependencies, maintain business continuity plans, and coordinate with crisis management during incidents.",
    complianceRequirements:
      "Continuity planning must align with business impact analyses, regulatory continuity obligations, and internal resilience standards.",
    exceptions:
      "Exceptions may be granted only for functions with minimal operational impact and require Chief Operational Resilience approval.",
    reviewFrequency: "Annual",
    approvalAuthority: "Chief Operating Officer"
  },
  {
    id: "GOV-012",
    title: "Document Retention",
    category: "Governance",
    version: "1.0",
    effectiveDate: "2026-07-01",
    purpose:
      "Set the framework for retaining, archiving, and disposing of records in a manner that preserves compliance, legal defensibility, and operational efficiency.",
    scope:
      "Applies to all corporate records, financial documents, contracts, employee files, and electronic communications managed by EcoSphere employees and contractors.",
    policyStatement:
      "EcoSphere will retain records for the required retention period, dispose of records securely when no longer needed, and preserve records subject to litigation holds.",
    employeeResponsibilities:
      "Store records in approved systems, follow retention schedules, and notify Legal when records are subject to litigation or regulatory hold.",
    managerResponsibilities:
      "Ensure team records are managed according to the retention schedule, approve record disposal, and support compliance audits.",
    complianceRequirements:
      "Retention practices must meet legal, regulatory, and contractual requirements and comply with EcoSphere’s records management standards.",
    exceptions:
      "Exceptions to disposal timelines require written approval from the Legal department in consultation with Compliance.",
    reviewFrequency: "Biennial",
    approvalAuthority: "Chief Legal Officer"
  }
];

export const policyById = new Map(policies.map((policy) => [policy.id, policy]));
