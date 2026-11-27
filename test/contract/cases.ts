import type { MockAnswer } from './mock-api.js';

export type CaseKind = 'success' | 'api-error' | 'wrong-format' | 'read-back' | 'invalid-input' | 'tool-error';

export interface ContractCase {
	id: string;
	tool: string;
	kind: CaseKind;
	args: Record<string, unknown>;
	answers?: MockAnswer[];
}

const ok = (body: unknown): MockAnswer => ({ status: 200, body });

const accountUsers = [
	{ id: 1, email: 'ann@acme.test', firstname: 'Ann', lastname: 'Lee', phone: null, jobtitle: null, date_lastlogin: '2026-11-01 10:00:00', extra: 'kept' },
];
const named = [{ id: 2, name: 'Clean', extra: 'kept' }];
const proposalTemplates = [
	{
		id: 5,
		name: 'Standard',
		automations_set_id: null,
		design_template_id: 2,
		text_template_id: 3,
		custom_fields: [{ label: 'Project', name: 'project', required: false, type: 'text', extra: 'kept' }],
	},
];
const vatGroups = [{ id: 1, label: 'High', name: 'high', vat: '21.00' }];
const proposalListItem = {
	id: 100,
	name: 'Website',
	account_user_id: 1,
	contact_id: 10,
	contact_name: 'Acme BV',
	date_created: '2026-02-01 09:00:00',
	directory_id: null,
	price_total: '1000.00',
	proposal_nr: '2026-001',
	status: 'open',
	version_id: 200,
	extra: 'kept',
};
const person = { id: 11, firstname: 'Bo', lastname: 'Ek', fullname: 'Bo Ek', email: 'bo@acme.test', extra: 'kept' };
const organisations = [{ id: 10, name: 'Acme BV', date_created: '2026-01-01', type: 'organisation', people: [person], city: null }];
const contactPeople = [
	{
		id: 11,
		contact_id: 10,
		type: 'person',
		organisation: 'Acme BV',
		date_created: '2026-01-01',
		firstname: 'Bo',
		lastname: 'Ek',
		fullname: 'Bo Ek',
		salutation: '',
	},
];
const contactDetails = {
	id: 10,
	name: 'Acme BV',
	date_created: '2026-01-01',
	type: 'organisation',
	city: 'Utrecht',
	people: [person],
	proposals: [proposalListItem],
	tags: [{ id: 7, name: 'vip' }],
	custom_hobby: 'knitting',
};
const proposalDetails = {
	id: 100,
	name: 'Website',
	status: 'open',
	price_total: '1000.00',
	content: {
		pricetables: [
			{ id: 'pt1', rows: [{ type: 'price', content: 'Design', price: 500 }] },
			{ id: 2024, rows: [{ type: 'text', content: 'Note' }] },
		],
	},
	extra: 'kept',
};
const productDirectories = [
	{ id: 20, name: 'Services' },
	{ id: 21, name: 'New' },
];
const products = [
	{ id: 30, name: 'Hour', descr_short: null, price: '95.00', vat_id: 1, vat_percentage: '21.00', sku: null, selectable: false, recurring: 'month' },
];
const apiError = (status: number, errors?: unknown): MockAnswer => ({ status, body: errors === undefined ? { message: 'failed' } : { errors } });

export const CASES: ContractCase[] = [
	{ id: 'get_initial_context', tool: 'get_initial_context', kind: 'success', args: {} },
	{ id: 'get_account_users', tool: 'get_account_users', kind: 'success', args: {}, answers: [ok(accountUsers)] },
	{ id: 'get_automation_sets', tool: 'get_automation_sets', kind: 'success', args: {}, answers: [ok([{ id: 3, name: 'Default' }])] },
	{ id: 'get_contact_details', tool: 'get_contact_details', kind: 'success', args: { contact_id: '10' }, answers: [ok(contactDetails)] },
	{ id: 'get_design_templates', tool: 'get_design_templates', kind: 'success', args: {}, answers: [ok(named)] },
	{ id: 'get_email_templates', tool: 'get_email_templates', kind: 'success', args: {}, answers: [ok(named)] },
	{ id: 'get_proposal_details', tool: 'get_proposal_details', kind: 'success', args: { proposal_id: 100 }, answers: [ok(proposalDetails)] },
	{
		id: 'get_proposal_details/no-pricetables',
		tool: 'get_proposal_details',
		kind: 'success',
		args: { proposal_id: 100 },
		answers: [ok({ ...proposalDetails, content: [] })],
	},
	{ id: 'get_proposal_directories', tool: 'get_proposal_directories', kind: 'success', args: {}, answers: [ok({ open: [{ id: 1, name: 'Q1' }], edit: [] })] },
	{ id: 'get_proposal_templates', tool: 'get_proposal_templates', kind: 'success', args: {}, answers: [ok(proposalTemplates)] },
	{ id: 'get_product_directories', tool: 'get_product_directories', kind: 'success', args: {}, answers: [ok(productDirectories)] },
	{ id: 'get_products', tool: 'get_products', kind: 'success', args: { directory_id: 20 }, answers: [ok(products)] },
	{ id: 'get_tags', tool: 'get_tags', kind: 'success', args: {}, answers: [ok([{ id: 7, name: 'vip' }])] },
	{ id: 'get_text_templates', tool: 'get_text_templates', kind: 'success', args: {}, answers: [ok(named)] },
	{ id: 'get_vat_groups', tool: 'get_vat_groups', kind: 'success', args: {}, answers: [ok(vatGroups)] },
	{ id: 'list_proposals', tool: 'list_proposals', kind: 'success', args: { status: 'open' }, answers: [ok([proposalListItem])] },
	{
		id: 'list_proposals/directory',
		tool: 'list_proposals',
		kind: 'success',
		args: { status: 'won', directory_id: 5, sort: 'date_created', page: 2 },
		answers: [ok([])],
	},
	{
		id: 'search_contact_organisations',
		tool: 'search_contact_organisations',
		kind: 'success',
		args: { search: 'Acme & Co/1' },
		answers: [ok(organisations)],
	},
	{ id: 'search_contact_people', tool: 'search_contact_people', kind: 'success', args: { search: 'Bo' }, answers: [ok(contactPeople)] },
	{ id: 'search_proposals', tool: 'search_proposals', kind: 'success', args: { search: 'web site' }, answers: [ok([proposalListItem])] },

	{
		id: 'create_contact',
		tool: 'create_contact',
		kind: 'success',
		args: { type: 'organisation', name: 'New BV', city: 'Delft', tags: [{ id: 7, name: 'vip' }], extra_key: 'kept' },
		answers: [ok({ id: 13 })],
	},
	// Today create_contact only accepts tags as { id, name } objects
	{ id: 'create_contact/string-tag', tool: 'create_contact', kind: 'invalid-input', args: { type: 'person', name: 'Bo', tags: ['vip'] } },
	{
		id: 'create_contact_person',
		tool: 'create_contact_person',
		kind: 'success',
		args: { contact_id: 10, name: 'Cy Do', email: 'cy@acme.test', custom_fields: { custom_hobby: 'knitting' } },
		answers: [ok({ id: 12, firstname: 'Cy', lastname: 'Do' })],
	},
	{
		id: 'create_product',
		tool: 'create_product',
		kind: 'success',
		args: { directory_id: 20, name: 'Hour', price: 95, vat_id: 1, selectable: false, recurring: 'month' },
		answers: [ok({ product_id: 31 })],
	},
	{
		id: 'create_product/limit',
		tool: 'create_product',
		kind: 'tool-error',
		args: { directory_id: 20, name: 'Hour', price: 95, vat_id: 1 },
		answers: [ok({ total: 'maximum_reached' })],
	},
	{
		id: 'create_product_directory',
		tool: 'create_product_directory',
		kind: 'success',
		args: { name: 'New' },
		answers: [ok({}), ok(productDirectories)],
	},
	{
		id: 'create_proposal',
		tool: 'create_proposal',
		kind: 'success',
		args: {
			contact_id: 10,
			contact_people: [11],
			design_template_id: 2,
			name: 'Website',
			proposal_template_id: 5,
			text_template_id: 3,
			tags: ['new', { id: 7, name: 'vip' }],
			custom_fields: [{ name: 'project', value: 'Site' }],
		},
		answers: [ok({ id: 101, version_id: 201 })],
	},
	{
		id: 'copy_proposal',
		tool: 'copy_proposal',
		kind: 'success',
		args: { proposal_id: 100, name: 'Copy', contact_id: 10, contact_people: [11] },
		answers: [ok({ id: 102, version_id: 202 })],
	},
	{
		id: 'send_proposal',
		tool: 'send_proposal',
		kind: 'success',
		args: { proposal_id: 100 },
		answers: [ok({ receivers: [{ email: 'bo@acme.test', fullname: 'Bo Ek', id: 11, proposal_link: 'https://acme.offorte.test/p/1' }] })],
	},
	{
		id: 'send_proposal/self',
		tool: 'send_proposal',
		kind: 'success',
		args: { proposal_id: 100, send_method: 'self', send_message: 'Hello', password_reset: true },
		answers: [ok({ receivers: [] })],
	},
	{
		id: 'update_contact',
		tool: 'update_contact',
		kind: 'success',
		args: { contact_id: 10, city: 'Utrecht', custom_fields: { custom_hobby: 'knitting' } },
		answers: [ok({}), ok(contactDetails)],
	},
	{
		id: 'update_contact_person',
		tool: 'update_contact_person',
		kind: 'success',
		args: { contact_id: 10, person_id: 11, email: 'bo@acme.test', tags: [] },
		answers: [ok({}), ok(person)],
	},
	{
		id: 'update_product',
		tool: 'update_product',
		kind: 'success',
		args: { product_id: 30, name: 'Hour', price: 100, vat_id: 1, sku: '', descr_short: '', selectable: 'check', recurring: false },
		answers: [ok({})],
	},
	{ id: 'update_product_directory', tool: 'update_product_directory', kind: 'success', args: { directory_id: 20, name: 'Renamed' }, answers: [ok({})] },
	{
		id: 'update_proposal',
		tool: 'update_proposal',
		kind: 'success',
		args: { proposal_id: 100, name: 'New name', price_total: 900 },
		answers: [ok({}), ok(proposalDetails)],
	},
	{ id: 'update_proposal/no-fields', tool: 'update_proposal', kind: 'tool-error', args: { proposal_id: 100 } },
	{
		id: 'update_proposal_pricetables',
		tool: 'update_proposal_pricetables',
		kind: 'success',
		args: {
			proposal_id: 100,
			pricetables: [
				{
					id: 'pt1',
					rows: [{ type: 'price', content: 'Design', price: 600, discount_value: '10', product_id: '', unique_id: 2024, vat_percentage: null }],
				},
			],
		},
		answers: [ok({}), ok(proposalDetails)],
	},
	{
		id: 'update_proposal_status',
		tool: 'update_proposal_status',
		kind: 'success',
		args: { proposal_id: 100, status: 'won' },
		answers: [ok(proposalDetails), ok({}), ok({ ...proposalDetails, status: 'won' })],
	},
	{
		id: 'update_proposal_status/same',
		tool: 'update_proposal_status',
		kind: 'success',
		args: { proposal_id: 100, status: 'open' },
		answers: [ok(proposalDetails)],
	},
	{
		id: 'update_proposal_status/won',
		tool: 'update_proposal_status',
		kind: 'tool-error',
		args: { proposal_id: 100, status: 'lost' },
		answers: [ok({ ...proposalDetails, status: 'won' })],
	},
	{ id: 'delete_proposal', tool: 'delete_proposal', kind: 'success', args: { proposal_id: 100 }, answers: [ok({})] },

	{ id: 'get_account_users/api-error', tool: 'get_account_users', kind: 'api-error', args: {}, answers: [apiError(404, { account: 'not found' })] },
	{ id: 'get_products/api-error', tool: 'get_products', kind: 'api-error', args: { directory_id: 20 }, answers: [apiError(500)] },
	{
		id: 'create_proposal/api-error',
		tool: 'create_proposal',
		kind: 'api-error',
		args: { contact_id: 10, contact_people: [11], design_template_id: 2, name: 'P', proposal_template_id: 5, text_template_id: 3 },
		answers: [apiError(422, { name: ['is required'] })],
	},
	{ id: 'get_account_users/wrong-format', tool: 'get_account_users', kind: 'wrong-format', args: {}, answers: [ok({ users: 'none' })] },
	{ id: 'get_proposal_details/wrong-format', tool: 'get_proposal_details', kind: 'wrong-format', args: { proposal_id: 100 }, answers: [ok({ id: 'x' })] },
	{ id: 'send_proposal/wrong-format', tool: 'send_proposal', kind: 'wrong-format', args: { proposal_id: 100 }, answers: [ok({ receivers: 'none' })] },

	{
		id: 'update_contact/read-back-error',
		tool: 'update_contact',
		kind: 'read-back',
		args: { contact_id: 10, city: 'Delft' },
		answers: [ok({}), apiError(500)],
	},
	{
		id: 'update_proposal/read-back-format',
		tool: 'update_proposal',
		kind: 'wrong-format',
		args: { proposal_id: 100, name: 'X' },
		answers: [ok({}), ok({ id: 100 })],
	},
	{
		id: 'update_proposal_pricetables/read-back-error',
		tool: 'update_proposal_pricetables',
		kind: 'read-back',
		args: { proposal_id: 100, pricetables: [{ id: 'pt1', rows: [] }] },
		answers: [ok({}), apiError(503)],
	},
	{
		id: 'create_product_directory/read-back-error',
		tool: 'create_product_directory',
		kind: 'read-back',
		args: { name: 'New' },
		answers: [ok({}), apiError(500)],
	},

	{ id: 'get_proposal_details/invalid', tool: 'get_proposal_details', kind: 'invalid-input', args: { proposal_id: 'x' } },
	{ id: 'get_contact_details/invalid', tool: 'get_contact_details', kind: 'invalid-input', args: {} },
	{ id: 'list_proposals/invalid-status', tool: 'list_proposals', kind: 'invalid-input', args: { status: 'deleted' } },
	{ id: 'list_proposals/invalid-page', tool: 'list_proposals', kind: 'invalid-input', args: { status: 'open', page: 0 } },
	{ id: 'create_proposal/invalid', tool: 'create_proposal', kind: 'invalid-input', args: { name: 'P' } },
	{ id: 'create_contact/invalid-type', tool: 'create_contact', kind: 'invalid-input', args: { type: 'company', name: 'X' } },
	{
		id: 'create_product/invalid-selectable',
		tool: 'create_product',
		kind: 'invalid-input',
		args: { directory_id: 20, name: 'H', price: 1, vat_id: 1, selectable: true },
	},
	{ id: 'update_product/missing-fields', tool: 'update_product', kind: 'invalid-input', args: { product_id: 30, name: 'H' } },
	{ id: 'send_proposal/invalid-method', tool: 'send_proposal', kind: 'invalid-input', args: { proposal_id: 100, send_method: 'email' } },
	{
		id: 'update_contact_person/invalid-custom-field',
		tool: 'update_contact_person',
		kind: 'invalid-input',
		args: { contact_id: 10, person_id: 11, custom_fields: { hobby: 'x' } },
	},
	{
		id: 'update_proposal_pricetables/invalid-table-id',
		tool: 'update_proposal_pricetables',
		kind: 'invalid-input',
		args: { proposal_id: 100, pricetables: [{ id: '', rows: [] }] },
	},
	{ id: 'update_proposal/invalid-tags', tool: 'update_proposal', kind: 'invalid-input', args: { proposal_id: 100, tags: [{ id: 'x' }] } },
	{ id: 'search_contact_organisations/invalid', tool: 'search_contact_organisations', kind: 'invalid-input', args: {} },
	{ id: 'search_contact_people/invalid', tool: 'search_contact_people', kind: 'invalid-input', args: { search: 5 } },
	{ id: 'search_proposals/invalid', tool: 'search_proposals', kind: 'invalid-input', args: {} },
	{ id: 'get_products/invalid', tool: 'get_products', kind: 'invalid-input', args: { directory_id: 'x' } },
	{
		id: 'create_contact_person/invalid-custom-field',
		tool: 'create_contact_person',
		kind: 'invalid-input',
		args: { contact_id: 10, name: 'Cy', custom_fields: { hobby: 'x' } },
	},
	{ id: 'update_contact/invalid-custom-field', tool: 'update_contact', kind: 'invalid-input', args: { contact_id: 10, custom_fields: { hobby: 'x' } } },
	{ id: 'copy_proposal/invalid', tool: 'copy_proposal', kind: 'invalid-input', args: { proposal_id: 100, name: 'Copy' } },
	{ id: 'update_proposal_status/invalid', tool: 'update_proposal_status', kind: 'invalid-input', args: { proposal_id: 100, status: 'deleted' } },
	{ id: 'delete_proposal/invalid', tool: 'delete_proposal', kind: 'invalid-input', args: { proposal_id: '100' } },
	{ id: 'create_product_directory/invalid', tool: 'create_product_directory', kind: 'invalid-input', args: {} },
	{ id: 'update_product_directory/invalid', tool: 'update_product_directory', kind: 'invalid-input', args: { directory_id: 20 } },
];
