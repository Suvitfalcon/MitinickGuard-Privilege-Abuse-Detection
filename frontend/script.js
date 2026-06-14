const API = "http://localhost:5000";

let users = [];

/* ------------------------
   Dashboard
-------------------------*/

async function loadDashboard() {

    try {

        const res = await axios.get(
            `${API}/dashboard`
        );

        const data = res.data;

        document.getElementById(
            "s-critical"
        ).textContent =
            data.critical_users || 0;

    } catch (err) {

        console.error(err);
    }
}

/* ------------------------
   Users
-------------------------*/

async function loadUsers() {

    try {

        const res = await axios.get(
            `${API}/users`
        );

        users = res.data;

            renderUsers();
            renderRiskChart();

    } catch (err) {

        console.error(err);
    }
}

function renderUsers() {

    const grid =
        document.getElementById(
            "user-grid"
        );

    if (!grid) return;

    grid.innerHTML = "";

    users.forEach((u, index) => {

        let riskClass = "low";

        if (u.risk_score >= 80)
            riskClass = "high";

        else if (u.risk_score >= 50)
            riskClass = "med";

        grid.innerHTML += `

        <div
            class="user-card risk-${riskClass}"
            onclick="openUser(${index})">

            <div class="risk-badge">

                <span class="tag ${
                    riskClass === "high"
                        ? "critical"
                        : riskClass === "med"
                        ? "warning"
                        : "ok"
                }">

                    ${u.risk_score}/100

                </span>

            </div>

            <div class="user-head">

                <div class="avatar">

                    ${u.username
                        .substring(0, 2)
                        .toUpperCase()}

                </div>

                <div class="user-info">

                    <h3>${u.username}</h3>

                    <p>${u.department}</p>

                </div>

            </div>

            <div
                style="
                margin-top:10px;
                color:#94a3b8">

                ${u.job_title}

            </div>

        </div>

        `;
    });
}

/* ------------------------
   User Modal
-------------------------*/

function openUser(index) {

    const u = users[index];

    document.getElementById(
        "modal-name"
    ).textContent =
        `${u.username} - Risk Profile`;

    document.getElementById(
        "modal-body"
    ).innerHTML = `

    <div class="detail-section">

        <h4>User Details</h4>

        <div class="detail-row">
            <span>Username</span>
            <span>${u.username}</span>
        </div>

        <div class="detail-row">
            <span>Department</span>
            <span>${u.department}</span>
        </div>

        <div class="detail-row">
            <span>Job Title</span>
            <span>${u.job_title}</span>
        </div>

        <div class="detail-row">
            <span>Privilege Level</span>
            <span>${u.privilege_level}</span>
        </div>

        <div class="detail-row">
            <span>Systems Access</span>
            <span>${u.systems_access}</span>
        </div>

        <div class="detail-row">
            <span>Inactive Days</span>
            <span>${u.days_inactive}</span>
        </div>

        <div class="detail-row">
            <span>Risk Score</span>
            <span>${u.risk_score}/100</span>
        </div>

    </div>

    `;
    
    document
        .getElementById("user-modal")
        .classList.add("open");
}

function closeModal() {

    document
        .getElementById("user-modal")
        .classList.remove("open");
}

/* ------------------------
   Top Risk Table
-------------------------*/

async function loadTopRisks() {

    try {

        const res = await axios.get(
            `${API}/top-risks`
        );

        const body =
            document.getElementById(
                "risk-table-body"
            );

        if (!body) return;

        body.innerHTML = "";

        res.data.forEach(user => {

            let tag = "ok";
            let status = "Low";

            if (user.score >= 80) {

                tag = "critical";
                status = "Critical";

            } else if (user.score >= 60) {

                tag = "warning";
                status = "High";
            }

            body.innerHTML += `

            <tr>

                <td>
                    ${user.username}
                </td>

                <td>

                    <span class="risk-score">

                        ${user.score}

                        <span class="risk-bar">

                            <span
                                class="risk-fill ${tag}"
                                style="
                                width:${user.score}%">
                            </span>

                        </span>

                    </span>

                </td>

                <td>
                    Privilege Abuse
                </td>

                <td>

                    <span class="tag ${tag}">

                        ${status}

                    </span>

                </td>

            </tr>

            `;
        });

    } catch (err) {

        console.error(err);
    }
}

/* ------------------------
   Risk Chart
-------------------------*/

function renderRiskChart() {
    const canvas = document.getElementById('riskChart');
    if (!canvas) return;

    const counts = { high: 0, med: 0, low: 0 };
    users.forEach(u => {
        if (u.risk_score >= 80) counts.high += 1;
        else if (u.risk_score >= 50) counts.med += 1;
        else counts.low += 1;
    });

    const data = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            data: [counts.high, counts.med, counts.low],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
        }]
    };

    const ctx = canvas.getContext('2d');

    if (window._riskChart) {
        window._riskChart.data = data;
        window._riskChart.update();
        return;
    }

    window._riskChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

/* ------------------------
   Alerts
-------------------------*/

async function loadAlerts() {

    try {

        const res = await axios.get(
            `${API}/alerts`
        );

        const container =
            document.getElementById(
                "alerts-container"
            );

        if (!container) return;

        container.innerHTML = "";

        res.data.forEach(alert => {

            container.innerHTML += `

            <div class="alert-item">

                <div class="alert-dot high"></div>

                <div>

                    <div class="alert-text">

                        ${alert.username}

                    </div>

                    <div class="alert-meta">

                        ${alert.alert}
                        -
                        ${alert.resource}

                    </div>

                </div>

            </div>

            `;
        });

    } catch (err) {

        console.error(err);
    }
}

/* ------------------------
   Navigation
-------------------------*/

function showPage(id, tab) {

    document
        .querySelectorAll(".page")
        .forEach(page =>
            page.classList.remove(
                "active"
            )
        );

    document
        .querySelectorAll(".nav-tab")
        .forEach(btn =>
            btn.classList.remove(
                "active"
            )
        );

    document
        .getElementById(
            "page-" + id
        )
        .classList.add("active");

    if (tab)
        tab.classList.add("active");
}

/* ------------------------
   Init
-------------------------*/

window.onload = () => {

    loadDashboard();

    loadUsers();

    loadTopRisks();

    loadAlerts();
};