# Résumé — Chapitre 2 : Modélisation des signaux


> [!note] En une phrase
> Un signal se regarde **en temps** ou **en fréquence** (son **spectre**). Fourier sert à démontrer **Shannon** ($f_e\ge2f_M$) ; Laplace (continu) et z (échantillonné) transforment les équations en algèbre.

## 1. Série de Fourier (signal périodique, période $T$)

$$s(t)=a_0+\sum_{n\ge1}\big[a_n\cos(n\omega t)+b_n\sin(n\omega t)\big]\qquad\omega=\frac{2\pi}T$$
$$a_0=\frac1T\int_T s\,dt\qquad a_n=\frac2T\int_T s\cos(n\omega t)\,dt\qquad b_n=\frac2T\int_T s\sin(n\omega t)\,dt$$

- $a_0$ = **valeur moyenne** (facteur $\frac1T$, contre $\frac2T$ pour $a_n$, $b_n$). On intègre sur n'importe quelle période.
- $s$ **paire** → $b_n=0$ ; $s$ **impaire** → $a_0=a_n=0$.
- Forme exponentielle : $s=\sum_{n\in\mathbb Z}c_ne^{in\omega t}$, $c_n=\frac1T\int_0^Ts\,e^{-in\omega t}dt$, avec $\boxed{c_n=\frac{a_n}2-i\frac{b_n}2}$.
- **Spectre de raies** : $|c_n|$ (amplitude) et $\arg c_n$ (phase) aux fréquences $nf_0$. Signal réel : amplitude **paire**, phase **impaire**.
- Train d'impulsions $Ш_a$ (largeur $t_0$, hauteur $\frac1{t_0}$) : $c_n=\frac1T\,\mathrm{sinc}\!\left(\frac{n\pi t_0}T\right)$. Si $t_0\to0$ : **peigne de Dirac**, toutes les raies valent $\frac1T$.

## 2. Transformée de Fourier (signal à énergie finie)

$$S(f)=\int_{-\infty}^{+\infty}s(t)\,e^{-i2\pi ft}\,dt\qquad s(t)=\int_{-\infty}^{+\infty}S(f)\,e^{i2\pi ft}\,df$$

- Spectre **continu**. Porte $\delta_a$ (largeur $t_0$, aire 1) → $\mathrm{sinc}(\pi ft_0)$, zéros en $\frac k{t_0}$.
- **Court en temps ⇔ large en fréquence** ; à la limite $\mathcal F(\delta)=1$.

| Propriété | Formule |
|---|---|
| Linéarité | $\mathcal F(af_1+bf_2)=aF_1+bF_2$ |
| Convolution ↔ produit | $\mathcal F(f_1*f_2)=F_1F_2$ et $\mathcal F(f_1f_2)=F_1*F_2$ |
| Retard | $s(t-t_0)\to S(f)\,e^{-i2\pi ft_0}$ (amplitude inchangée) |
| Dirac | $\mathcal F(\delta)=1$ |
| Cosinus | $\hat X\cos(2\pi f_0t+\varphi)$ → deux raies de hauteur $\frac{\hat X}2$ en $\pm f_0$ |
| Signal réel | $S(-f)=\overline{S(f)}$ : amplitude paire, phase impaire |
| Parseval | $\displaystyle\int s^2\,dt=\int\lvert S(f)\rvert^2\,df$ |

## 3. Modulation d'amplitude

$$x(t)=m(t)\cdot\hat P\cos(2\pi f_pt)\quad\Longrightarrow\quad\boxed{X(f)=\frac{\hat P}2M(f-f_p)+\frac{\hat P}2M(f+f_p)}$$
Multiplier par un cosinus **recopie le spectre** autour de $\pm f_p$, sans le déformer.

## 4. Shannon

1. Échantillonner = **multiplier par le peigne** : $x^*(t)=x(t)\cdot\sum_n\delta(t-nT_e)$.
2. Le spectre du peigne est un peigne de raies $\frac1{T_e}$ tous les $f_e$.
3. Par modulation : $X^*(f)=\frac1{T_e}\sum_{n\in\mathbb Z}X(f-nf_e)$ → **spectre recopié tous les $f_e$**.
4. Les copies ne se chevauchent pas si $f_e-f_M\ge f_M$.

> [!success] Théorème de Shannon
> Un signal de fréquence maximale $f_M$ est reconstituable à partir de ses échantillons si $\boxed{f_e\ge2f_M}$ (reconstruction : passe-bas idéal de coupure $\frac{f_e}2$, gain $T_e$).

- Sinon : **repliement de spectre**, une fréquence $f>\frac{f_e}2$ réapparaît en $\lvert f-kf_e\rvert$ (ex. 7 kHz à $f_e=10$ kHz → 3 kHz).
- En pratique : **filtre anti-repliement** passe-bas à $\frac{f_e}2$, placé **avant** le CAN.

## 5. Laplace (signaux causaux continus)

> [!warning] §2.2 et §2.3 reconstruits sans les pages du prof : à vérifier.

$$X(p)=\int_0^{+\infty}x(t)\,e^{-pt}\,dt$$

| $x(t)$ | $\delta$ | $u$ | $t$ | $e^{-at}$ | $te^{-at}$ | $\sin\omega t$ | $\cos\omega t$ |
|---|---|---|---|---|---|---|---|
| $X(p)$ | $1$ | $\dfrac1p$ | $\dfrac1{p^2}$ | $\dfrac1{p+a}$ | $\dfrac1{(p+a)^2}$ | $\dfrac\omega{p^2+\omega^2}$ | $\dfrac p{p^2+\omega^2}$ |

- Dériver → $pX-x(0^+)$ ; intégrer → $\frac Xp$ ; retard $\tau$ → $e^{-\tau p}X$ ; convolution → produit.
- Valeur initiale $\lim_{p\to\infty}pX(p)$ ; valeur finale $\lim_{p\to0}pX(p)$.

## 6. Transformée en z (signaux échantillonnés causaux)

$$X(z)=\sum_{n\ge0}x_n\,z^{-n}\qquad z=e^{pT_e}$$

| $x_n$ | impulsion | échelon | $n$ | $a^n$ |
|---|---|---|---|---|
| $X(z)$ | $1$ | $\dfrac z{z-1}$ | $\dfrac z{(z-1)^2}$ | $\dfrac z{z-a}$ |

- $z^{-1}$ = **retard d'une période** : $x_{n-k}\to z^{-k}X(z)$ ; avance $x_{n+1}\to zX-zx_0$.
- Valeur finale $\lim_{z\to1}(z-1)X(z)$. Une récurrence d'automate devient une équation algébrique en $z$.
