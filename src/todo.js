import './index.html';
// import './app.scss';
import element from 'nej-commonjs/base/element';
import event from 'nej-commonjs/base/event';
import tpl from 'nej-commonjs/util/template/tpl';
import dolar from 'nej-commonjs/util/chain/NodeList';

// 前端缓存todos数据
let todos = [];
let server = '119.29.243.115:82';

const addTODO = (todo) => {
    let tpl = `<li class="${todo.status === 'completed' ? 'completed' : ''}" data-id="${todo._id}">
            <div class="view">
                <input class="toggle" type="checkbox" ${todo.status === 'completed' ? 'checked' : ''}>
                <label>${todo.text}</label>
                <button class="destroy"></button>
            </div>
            <input class="edit" value="">
        </li>`;
    tpl = element._$html2node(tpl);
    dolar('#todo-list')[0].appendChild(tpl);
    console.log('[add TODO]', todo);
}

const updateCount = () => {
    const num = todos.filter(todo => todo.status === 'active').length;
    dolar('#todo-count > strong')[0].innerHTML = num;
}

const initEvent = () => {
    // 添加TODO
    dolar('#new-todo')._$addEvent('keydown', e => {
        if (e.code === 'Enter') {
            let text = e.target.value.trim()
            // 排除空输入
            if (!text) {
                return;
            }
            const todo = {
                text: text,
                status: 'active'
            };
            fetch(`http://${server}/api/todos`, {
                'method': 'POST',
                'headers': new Headers({
                    "Content-Type": "application/json"
                }),
                'body': JSON.stringify(todo)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        alert('错误：' + error);
                        return;
                    }
                    console.log('[fetch new-todo]', data);
                    todo._id = data._id;
                    if(location.hash.slice(2) !== 'completed') {
                        addTODO(todo);
                    }
                    todos.push(todo);
                    e.target.value = '';
                    updateCount();
                    alert('TODO添加成功');  
                    console.log('[new TODO]', e);
                });
        }
    });

    dolar('#todo-list')._$addEvent('click', e => {
        const ele = e.target;
        let li, id;
        // 事件代理
        switch (ele.className) {
            case 'destroy': // 删除TODOs
                li = dolar(e.target)._$parent('li')[0];
                id = li.dataset.id;
                fetch(`http://${server}/api/todos/${id}`, {
                    'method': 'DELETE',
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            alert('错误：' + error);
                            return;
                        }
                        element._$remove(li, false);
                        todos = todos.filter(todo => todo._id !== id);
                        updateCount();
                        console.log('[destroy]', id);
                    });
                break;
            case 'toggle': // toggle TODO
                li = dolar(e.target)._$parent('li')[0];
                id = li.dataset.id;
                let newStatus;
                let filter = location.hash.slice(2);
                fetch(`http://${server}/api/todos/${id}`, {
                    'method': 'PATCH',
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.error) {
                            alert('错误：' + error);
                            return;
                        }
                        if (element._$hasClassName(li, 'completed')) {
                            element._$delClassName(li, 'completed');
                            newStatus = 'active';
                        } else {
                            element._$addClassName(li, 'completed');
                            newStatus = 'completed';
                        }
                        todos.forEach(todo => {
                            if(todo._id === id) {
                                todo.status = newStatus;
                            }
                        });
                        if(filter && newStatus !== filter && filter !== 'all') {
                            element._$remove(li, false);
                        }
                        updateCount();
                        console.log('[toggle TODO]');
                    });
        }
    });

    // filter TODO
    dolar('#filters > li > a')._$addEvent('click', e => {
        // 改变active样式
        dolar('#filters > li > a')._$forEach((a) => {
            if (element._$hasClassName(a, 'selected')) {
                element._$delClassName(a, 'selected');
            }
        });
        element._$addClassName(e.target, 'selected');
        console.log('[filter]', e.target);
    });

    window.onhashchange = (e) => {
        const filter = location.hash.slice(2);
        renderTODOS(filter);
        console.log('[change hash]', e, location.hash);
    }
}



const renderTODOS = (filter) => {
    // 清除旧状态
    dolar('#todo-list')._$clearChildren();
    let filterTodos
    // filter默认为all
    if (!filter || filter === 'all') {
        filterTodos = todos;
    } else {
        filterTodos = todos.filter((todo) => todo.status === filter);
    }
    filterTodos.forEach(todo => {
        addTODO(todo);
    });
}

const initTODOS = () => {
    fetch(`http://${server}/api/todos`, {
        'method': 'GET'
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert('错误：' + error);
                return;
            }
            console.log('[fetch data]', data);
            todos = data;
            renderTODOS();
            updateCount();
            initEvent();
        });
}

// 初始化TODO应用
initTODOS();