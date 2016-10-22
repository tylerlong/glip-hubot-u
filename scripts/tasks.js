// Description:
//   List Glip tasks per Group with assignees (Martin A)
//
// Commands:
//   tasks - List Glip tasks per Group with assignees

const _ = require('lodash');
const { glip_request } = require('../glip');
const { engine } = require('../nunjucks');


module.exports = (robot) => {

  robot.hear(/^tasks$/i, { id: 'tasks' }, (res) => {

    glip_request(robot, '/api/items', 'GET', { type_id: 9, group_id: res.envelope.room }).then((pack) => {
      let tasks = pack.body;
      tasks = _.filter(tasks, (task) => {
        return task.complete == false && _.includes(task.group_ids, res.envelope.room);
      });
      Promise.all(tasks.map((task) => {
        return glip_request(robot, '/api/person/' + task.assigned_to_ids[0], 'GET', {})
      })).then((persons) => {
        tasks = tasks.map((task, index) => {
          return {
            title: task.text,
            assignee: persons[index].body.display_name
          };
        });
        const markdown = engine.render('tasks/list.njk', { tasks });
        res.send(markdown);
      }).catch(() => {
        res.send('Unable to retrive tasks at the moment');
      });
    }).catch(() => {
      res.send('Unable to retrive tasks at the moment');
    });
  });

}



///////// task: ///////////
// { _id: 23024762889,
//     created_at: 1477048935703,
//     creator_id: 3195740163,
//     version: 6311638271524864,
//     is_new: false,
//     post_ids: [ 1022593048580 ],
//     group_ids: [ 2891325446 ],
//     assigned_to_ids: [ 1586462723 ],
//     complete: false,
//     text: 'create PPT',
//     due: null,
//     notes: '至少得打个草稿啥的。\r\n\r\n这个task纯为了测试。',
//     section: '',
//     complete_type: 'boolean',
//     color: '',
//     start: null,
//     repeat: '',
//     has_due_time: false,
//     function_id: 'task',
//     company_id: 44466177,
//     type_id: 9,
//     modified_at: 1477048935730,
//     deactivated: false },


/////// user: //////////
//  { body:
//      { _id: 4627939331,
//        created_at: 1476870574836,
//        creator_id: 4627939331,
//        version: 4921775238414336,
//        is_new: false,
//        company_id: 1741660161,
//        email: 'tyler.long@qq.com',
//        email_friendly_abbreviation: 'tyler.long',
//        promo_code: null,
//        is_webmail: true,
//        foreign_id: null,
//        landing_page: null,
//        first_user: true,
//        externally_registered: null,
//        state_id: 4623958023,
//        profile_id: 4623949839,
//        searchable_email: 'tyler.long@qq.com',
//        modified_at: 1477011436024,
//        deactivated: false,
//        hubspot_utk: '5c46267910269fc47d32c09ace6b1d25',
//        timezone_info: [Object],
//        model_id: '4627939331',
//        first_name: 'Ultimate',
//        searchable_first_name: 'ultimate',
//        last_name: 'Bot',
//        searchable_last_name: 'bot',
//        job_title: 'Chatbot',
//        headshot: [Object],
//        headshot_version: 1476871004053,
//        registered_at: 1476871025875,
//        registered_via: 'web',
//        explicit_host_company_ids: [Object],
//        host_company_ids: [Object],
//        removed_host_company_ids: [],
//        homepage: '',
//        location: '',
//        birthday: '',
//        gender: '',
//        employee_since: '',
//        has_rc_access_token: false,
//        has_registered: true,
//        display_name: 'Ultimate Bot' },
