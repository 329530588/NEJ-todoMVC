import './index.html';
import '../static/app.scss';
import element from 'nej-commonjs/base/element'
import event from 'nej-commonjs/base/event'
import tpl from 'nej-commonjs/util/template/tpl'
import dolar from 'nej-commonjs/util/chain/NodeList'

let todos = [{ 'text': '起床', status: 'completed' }, { 'text': '小便', status: 'active' }, { 'text': '刷牙', status: 'active' }];

const addTODO = (todo) => {
    let tpl = `<li class="${todo.status === 'completed' ? 'completed' : ''}" data-text="${todo.text}">
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
            if (!text) {
                return;
            }
            const todo = {
                text: text,
                status: 'active'
            };
            todos.push(todo);
            addTODO(todo);
            e.target.value = '';
            updateCount();
            console.log('[new TODO]', e);
        }
    });

    dolar('#todo-list')._$addEvent('click', e => {
        const ele = e.target;
        let li;
        // 事件代理
        switch (ele.className) {
            case 'destroy': // 删除TODOs
                li = dolar(e.target)._$parent('li')[0];
                let label = li.dataset.text
                element._$remove(li, false);
                todos = todos.filter((todo) => todo.text !== label);
                updateCount();
                console.log('[destroy]', label);
                break;
            case 'toggle': // toggle TODO
                li = dolar(e.target)._$parent('li')[0];
                let newStatus;
                if (element._$hasClassName(li, 'completed')) {
                    element._$delClassName(li, 'completed');
                    newStatus = 'active';
                } else {
                    element._$addClassName(li, 'completed');
                    newStatus = 'completed';
                }
                todos.forEach(todo => {
                    if(todo.text === li.dataset.text) {
                        todo.status = newStatus
                    }
                });
                updateCount();
                console.log('[toggle TODO]');
        }
    });

    // filter TODO
    dolar('#filters > li > a')._$addEvent('click', e => {
        dolar('#filters > li > a')._$forEach((a) => {
            if(element._$hasClassName(a, 'selected')) {
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
    renderTODOS();
    updateCount();
    initEvent();
}


// 初始化TODO应用
initTODOS();