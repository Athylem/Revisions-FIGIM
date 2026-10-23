# Résumé — Chapitre 1 : Signaux et systèmes


> [!note] En une phrase
> Un **système** transforme des **signaux d'entrée** (commande + perturbations) en un **signal de sortie** ; on le teste avec des **signaux types**, la sortie se calcule par **convolution**, et on n'étudie que les **SLIT**.

## 1. Signal, système, entrées

- **Signal** : grandeur qui varie dans le temps ($\theta_v$, $\theta_e$, $\theta_s$ du chauffe-eau). **Système** : ce qui fait évoluer la sortie en fonction des entrées. Dans le cours : **une seule sortie**.
- **Commande** (consigne) $e$ : entrée réglée volontairement. **Perturbations** $p_1, p_2\dots$ : entrées subies.

| Étude | On fait varier… | Question posée |
|---|---|---|
| **Pilotage** (poursuite) | la commande | la sortie suit-elle la consigne, et en combien de temps ? |
| **Régulation** | une perturbation | la sortie reste-t-elle à sa valeur ? |

## 2. Familles de signaux

| Famille | Définition | À retenir |
|---|---|---|
| **Périodique** | $x(t+T)=x(t)$, $T$ = plus petite période | $\omega=2\pi f=\dfrac{2\pi}T$ ; outil : série de Fourier |
| **Énergie finie** | $E=\displaystyle\int_{-\infty}^{+\infty}x^2(t)\,dt<\infty$ | signal qui s'éteint ; $Ae^{-\lvert t\rvert/\tau}$ → $E=\tau A^2$ ; une sinusoïde n'est **pas** à énergie finie ; outil : transformée de Fourier |
| **Causal** | $x(t)=0$ pour $t<0$ | si $x$ vaut $x_0\neq0$ avant 0, on étudie l'**écart** $\tilde x=x-x_0$ |
| **Échantillonné** | $x_n=x(nT_e)$, $f_e=\dfrac1{T_e}$ | signal discret (automate, PC) ; condition sur $f_e$ : Shannon (ch. 2) |

$p(t)=x^2(t)$ = puissance instantanée **normalisée** (dans une résistance de $1\ \Omega$).

## 3. Les signaux types

| Signal | Définition | Réponse du système | Sens physique |
|---|---|---|---|
| **Dirac** $\delta$ | nul sauf en 0, **aire 1** | réponse **impulsionnelle** $h$ | choc, coup de marteau |
| **Échelon** $u$ | 0 pour $t<0$, 1 pour $t>0$ | réponse **indicielle** | on allume d'un coup (test le plus utilisé) |
| **Rampe** $r$ | $r(t)=t$ pour $t\ge0$ | | consigne qui monte régulièrement |
| **Parabole** $f$ | $f(t)=\frac12t^2$ pour $t\ge0$ | | consigne qui accélère |
| **Sinusoïde** | $\cos(\omega t+\varphi)$, $\varphi=\omega t_0$ | | test fréquence par fréquence (Bode) |

> [!tip] La chaîne des dérivées
> $$\text{parabole}\xrightarrow{\ \frac{d}{dt}\ }\text{rampe}\xrightarrow{\ \frac{d}{dt}\ }\text{échelon}\xrightarrow{\ \frac{d}{dt}\ }\text{Dirac}$$
> soit $r=\frac{df}{dt}$, $u=\frac{dr}{dt}$, $\delta=\frac{du}{dt}$. Le Dirac est la limite d'une porte de largeur $t_0$ et de hauteur $\frac1{t_0}$ quand $t_0\to0$.

## 4. Convolution

$$(x_1*x_2)(t)=\int_{-\infty}^{+\infty}x_1(\tau)\,x_2(t-\tau)\,d\tau\qquad\text{signaux causaux : }\int_0^tx_1(\tau)\,x_2(t-\tau)\,d\tau$$

- Méthode : **retourner** $x_2$, la **décaler** de $t$, **multiplier** par $x_1$, prendre l'**aire**.
- $\delta$ est l'**élément neutre** : $x*\delta=x$, et $x*\delta(t-t_0)=x(t-t_0)$ (retard).
- Sortie d'un SLIT : $\boxed{s=h*e}$. Fourier et Laplace changent la convolution en **produit**.
- Exemple : $u*u=r$ → convoler par un échelon revient à **intégrer**.
- Version échantillonnée : $x_n=\sum_{i=0}^{n}x_{1i}\,x_{2(n-i)}$ (signaux causaux), avec $\delta_0=1$ et $\delta_n=0$ sinon.

## 5. Catégories de systèmes

| Propriété | Définition | En clair |
|---|---|---|
| **Linéaire** | $ae_1+be_2\to as_1+bs_2$ | superposition ; contre-exemples : saturation, frottements secs, seuils |
| **Causal** | toute entrée causale donne une sortie causale | l'effet ne précède pas la cause |
| **Stable** | toute entrée bornée donne une sortie bornée | $s'+s=e$ : stable ($s=1-e^{-t}$) ; $s'-s=e$ : instable ($s=e^t-1$) |
| **Invariant** | $e(t-t_0)\to s(t-t_0)$ | le système ne vieillit pas : coefficients constants |

> [!important] SLIT
> Un SLIT (linéaire, invariant, causal) est décrit par une **équation différentielle linéaire à coefficients constants** entre $e$ et $s$.
> Il est **causal** si l'ordre de dérivation de la **sortie** est **≥** celui de l'**entrée**.
> Exemple : $\tau\frac{de}{dt}+e=\frac1{\omega_0^2}\frac{d^2s}{dt^2}+\frac{2\xi}{\omega_0}\frac{ds}{dt}+s$ → ordre 2 ≥ 1 : SLIT causal.

La **stabilité** se lit déjà sur les **signes** de l'équation (un amortissement négatif $-\frac{2\xi}{\omega_0}\frac{ds}{dt}$ fait diverger les oscillations) ; au ch. 3 : stable ⇔ pôles à partie réelle négative.
